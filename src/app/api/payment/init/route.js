import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Pet from "@/lib/models/Pet";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import {
  createAppUrl,
  getSslCommerzConfig,
  markPendingSslCommerzTransaction,
  normalizeBdPhone,
  SSL_METHOD_CODES,
} from "@/lib/payments/sslcommerz";
import { DELIVERY_FEE, PLATFORM_FEE } from "@/lib/payments/fees";
import { revalidatePublicPetListings } from "@/lib/revalidate-public-pets";

const paymentMethods = Object.keys(SSL_METHOD_CODES);

function getBearerToken(request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
}

export async function POST(request) {
  let transaction;
  let tranId;

  try {
    const token = getBearerToken(request);
    if (!token) return Response.json({ error: "Please sign in to adopt a pet." }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    if (decoded.role !== "user") {
      return Response.json({ error: "Only adopters can complete an adoption." }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid checkout request." }, { status: 400 });
    }

    const { petId, paymentMethod } = body || {};
    if (!mongoose.isValidObjectId(petId)) {
      return Response.json({ error: "Invalid pet listing." }, { status: 400 });
    }
    if (!paymentMethods.includes(paymentMethod)) {
      return Response.json({ error: "Choose a supported payment method." }, { status: 400 });
    }

    await connectDB();
    const [buyer, pet] = await Promise.all([
      User.findById(decoded.id).select("name email role phone status"),
      Pet.findById(petId),
    ]);

    if (!buyer || buyer.status !== "active" || buyer.role !== "user") {
      return Response.json({ error: "Your account cannot make this adoption." }, { status: 403 });
    }
    if (!pet) return Response.json({ error: "Pet not found." }, { status: 404 });
    if (pet.listedBy.toString() === buyer._id.toString()) {
      return Response.json({ error: "You cannot adopt a pet listed by your account." }, { status: 403 });
    }
    if (pet.status !== "approved") {
      return Response.json({ error: "This pet is no longer available for adoption." }, { status: 409 });
    }

    const listedAmount = Number(pet.price ?? 0);
    if (!Number.isFinite(listedAmount) || listedAmount < 0) {
      return Response.json({ error: "This listing has an invalid adoption fee." }, { status: 400 });
    }
    if (Number(listedAmount.toFixed(2)) !== listedAmount) {
      return Response.json(
        { error: "The adoption fee must be set to two decimal places or fewer." },
        { status: 400 }
      );
    }
    const amount = Number((Number(listedAmount.toFixed(2)) + DELIVERY_FEE + PLATFORM_FEE).toFixed(2));

    if (amount < 10 || amount > 500000) {
      return Response.json(
        { error: "SSLCommerz supports total payments from ৳10 to ৳500,000." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeBdPhone(buyer.phone);
    if (!normalizedPhone) {
      return Response.json(
        { error: "Your profile must include a valid Bangladesh mobile number to continue with checkout." },
        { status: 400 }
      );
    }

    const config = getSslCommerzConfig();
    const existingTransaction = await Transaction.findOne({
      pet: pet._id,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (existingTransaction) {
      if (
        existingTransaction.gateway === "sslcommerz" &&
        existingTransaction.buyer.toString() === buyer._id.toString() &&
        existingTransaction.paymentMethod === paymentMethod &&
        existingTransaction.gatewayPageUrl
      ) {
        return Response.json({ url: existingTransaction.gatewayPageUrl });
      }
      return Response.json(
        { error: "A payment session is already pending for this pet. Complete or cancel it first." },
        { status: 409 }
      );
    }

    tranId = uuidv4().replaceAll("-", "").slice(0, 30);
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const reservedPet = await Pet.findOneAndUpdate(
          { _id: pet._id, status: "approved" },
          { $set: { status: "reserved" } },
          { new: true, session }
        );
        if (!reservedPet) {
          const error = new Error("This pet is no longer available for adoption.");
          error.status = 409;
          throw error;
        }

        [transaction] = await Transaction.create(
          [
            {
              buyer: buyer._id,
              seller: pet.listedBy,
              pet: pet._id,
              adopterName: buyer.name,
              petName: pet.name,
              amount,
              adoptionFee: Number(listedAmount.toFixed(2)),
              deliveryFee: DELIVERY_FEE,
              platformFee: PLATFORM_FEE,
              currency: "BDT",
              status: "pending",
              orderStatus: "pending",
              gateway: "sslcommerz",
              paymentMethod,
              tranId,
            },
          ],
          { session }
        );
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.pet) {
        return Response.json(
          { error: "A payment session is already pending for this pet. Complete or cancel it first." },
          { status: 409 }
        );
      }
      throw error;
    } finally {
      await session.endSession();
    }

    revalidatePublicPetListings();

    const formData = new URLSearchParams({
      store_id: config.storeId,
      store_passwd: config.storePassword,
      total_amount: amount.toFixed(2),
      currency: "BDT",
      tran_id: tranId,
      success_url: createAppUrl("/api/payment/success"),
      fail_url: createAppUrl("/api/payment/fail", { tran_id: tranId }),
      cancel_url: createAppUrl("/api/payment/cancel", { tran_id: tranId }),
      ipn_url: createAppUrl("/api/payment/ipn"),
      multi_card_name: SSL_METHOD_CODES[paymentMethod],
      value_a: pet._id.toString(),
      cus_name: buyer.name.slice(0, 50),
      cus_email: buyer.email.slice(0, 50),
      cus_add1: "Bangladesh",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: normalizedPhone,
      shipping_method: "NO",
      product_name: pet.name.slice(0, 100),
      product_category: "Pet Adoption",
      product_profile: "general",
    });

    const response = await fetch(config.sessionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Payment gateway could not start a checkout session.");

    const gatewayData = await response.json();
    if (gatewayData.status !== "SUCCESS" || !gatewayData.GatewayPageURL) {
      await markPendingSslCommerzTransaction(tranId, "failed");
      transaction = null;
      return Response.json(
        { error: "Payment gateway could not start a checkout session. Please try again." },
        { status: 502 }
      );
    }

    const availableGateways = Object.values(gatewayData.gw || {})
      .flatMap((gatewayList) =>
        Array.isArray(gatewayList)
          ? gatewayList
          : typeof gatewayList === "string"
            ? gatewayList.split(",")
            : []
      )
      .map((gateway) => gateway.trim());

    if (!availableGateways.includes(SSL_METHOD_CODES[paymentMethod])) {
      await markPendingSslCommerzTransaction(tranId, "failed");
      transaction = null;
      return Response.json(
        { error: "This payment method is not enabled for the merchant account." },
        { status: 409 }
      );
    }

    const gatewayUrl = new URL(gatewayData.GatewayPageURL);
    if (gatewayUrl.protocol !== "https:" || gatewayUrl.origin !== config.gatewayOrigin) {
      throw new Error("Payment gateway returned an unexpected checkout URL.");
    }

    await Transaction.updateOne(
      { _id: transaction._id, status: "pending" },
      {
        $set: { gatewayPageUrl: gatewayUrl.toString() },
      }
    );

    return Response.json({ url: gatewayUrl.toString() });
  } catch (error) {
    if (transaction) {
      await markPendingSslCommerzTransaction(tranId, "failed");
    }

    console.error("Payment initialization failed:", error.name || "Unknown error");
    return Response.json(
      {
        error:
          error.status === 409
            ? error.message
            : "Unable to start secure checkout. Please try again.",
      },
      { status: error.status || 500 }
    );
  }
}
