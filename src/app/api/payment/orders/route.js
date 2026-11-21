import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Pet from "@/lib/models/Pet";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { DELIVERY_FEE, PLATFORM_FEE } from "@/lib/payments/fees";
import { normalizeBdPhone } from "@/lib/payments/sslcommerz";
import { revalidatePublicPetListings } from "@/lib/revalidate-public-pets";

const onlineMethods = ["bkash", "nagad", "rocket"];
const codMethod = "cash_on_delivery";

function getBearerToken(request) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
}

function requiredText(value, maxLength) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : "";
}

class OrderRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function POST(request) {
  const token = getBearerToken(request);
  if (!token) return Response.json({ error: "Please sign in to place an order." }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  if (decoded.role !== "user") {
    return Response.json({ error: "Only adopters can place an order." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid order request." }, { status: 400 });
  }

  const { petId, paymentMethod } = body || {};
  if (!mongoose.isValidObjectId(petId)) {
    return Response.json({ error: "Invalid pet listing." }, { status: 400 });
  }
  if (paymentMethod !== codMethod && !onlineMethods.includes(paymentMethod)) {
    return Response.json({ error: "Choose a supported payment method." }, { status: 400 });
  }

  let deliveryInfo;
  let customerPhone;
  let customerTransactionId = "";
  if (paymentMethod === codMethod) {
    const data = body.deliveryInfo || {};
    const mobileNumber = normalizeBdPhone(data.mobileNumber);
    const rawAlternativeContactNumber =
      typeof data.alternativeContactNumber === "string" ? data.alternativeContactNumber.trim() : "";
    const alternativeContactNumber = rawAlternativeContactNumber
      ? normalizeBdPhone(rawAlternativeContactNumber)
      : "";
    const email = typeof data.email === "string" ? data.email.trim() : "";

    deliveryInfo = {
      fullName: requiredText(data.fullName, 100),
      mobileNumber,
      email,
      fullAddress: requiredText(data.fullAddress, 1000),
      division: requiredText(data.division, 100),
      district: requiredText(data.district, 100),
      area: requiredText(data.area, 100),
      postalCode: typeof data.postalCode === "string" ? data.postalCode.trim().slice(0, 20) : "",
      alternativeContactNumber: alternativeContactNumber || "",
      deliveryInstructions:
        typeof data.deliveryInstructions === "string" ? data.deliveryInstructions.trim().slice(0, 1000) : "",
    };

    if (
      !deliveryInfo.fullName ||
      !mobileNumber ||
      !deliveryInfo.fullAddress ||
      !deliveryInfo.division ||
      !deliveryInfo.district ||
      !deliveryInfo.area
    ) {
      return Response.json(
        { error: "Complete all required delivery details with a valid Bangladesh mobile number." },
        { status: 400 }
      );
    }
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (rawAlternativeContactNumber && !alternativeContactNumber) {
      return Response.json({ error: "Enter a valid alternative Bangladesh mobile number." }, { status: 400 });
    }
    customerPhone = mobileNumber;
  } else {
    const data = body.paymentDetails || {};
    customerPhone = normalizeBdPhone(data.mobileNumber);
    customerTransactionId = requiredText(data.transactionId, 100);
    if (!customerPhone || !customerTransactionId) {
      return Response.json(
        { error: "Enter a valid Bangladesh mobile banking number and transaction ID." },
        { status: 400 }
      );
    }
  }

  try {
    await connectDB();
    const session = await mongoose.startSession();
    let order;
    let created = false;
    const expectedGateway = paymentMethod === codMethod ? "cash_on_delivery" : "manual";

    try {
      await session.withTransaction(async () => {
        const buyer = await User.findById(decoded.id)
          .select("name email role status")
          .session(session);
        if (!buyer || buyer.status !== "active" || buyer.role !== "user") {
          throw new OrderRequestError("Your account cannot place this order.", 403);
        }

        const existingOrder = await Transaction.findOne({
          pet: petId,
          status: "pending",
          gateway: { $in: ["manual", "cash_on_delivery", "sslcommerz"] },
        })
          .select("_id buyer paymentMethod gateway orderStatus")
          .session(session);
        if (existingOrder) {
          if (
            existingOrder.buyer.toString() === buyer._id.toString() &&
            existingOrder.paymentMethod === paymentMethod &&
            existingOrder.gateway === expectedGateway
          ) {
            await Transaction.updateOne(
              { _id: existingOrder._id, status: "pending" },
              {
                $set: {
                  customerPhone,
                  customerTransactionId,
                  ...(deliveryInfo ? { deliveryInfo } : {}),
                },
              },
              { session }
            );
            order = existingOrder;
            return;
          }
          throw new OrderRequestError("An order is already pending for this pet.", 409);
        }

        const pet = await Pet.findById(petId).session(session);
        if (!pet) throw new OrderRequestError("Pet not found.", 404);
        if (pet.listedBy.toString() === buyer._id.toString()) {
          throw new OrderRequestError("You cannot adopt a pet listed by your account.", 403);
        }
        if (pet.status !== "approved") {
          throw new OrderRequestError("This pet is no longer available for adoption.", 409);
        }

        const adoptionFee = Number(pet.price ?? 0);
        if (!Number.isFinite(adoptionFee) || adoptionFee < 0 || Number(adoptionFee.toFixed(2)) !== adoptionFee) {
          throw new OrderRequestError("This listing has an invalid adoption fee.", 400);
        }
        const amount = Number((adoptionFee + DELIVERY_FEE + PLATFORM_FEE).toFixed(2));
        if (!Number.isFinite(amount)) {
          throw new OrderRequestError("This order amount is invalid.", 400);
        }

        const reservedPet = await Pet.findOneAndUpdate(
          { _id: pet._id, status: "approved" },
          { $set: { status: "reserved" } },
          { new: true, session }
        );
        if (!reservedPet) {
          throw new OrderRequestError("This pet is no longer available for adoption.", 409);
        }

        const now = new Date();
        const [createdOrder] = await Transaction.create(
          [
            {
              buyer: buyer._id,
              seller: pet.listedBy,
              pet: pet._id,
              adopterName: buyer.name,
              petName: pet.name,
              amount,
              adoptionFee,
              deliveryFee: DELIVERY_FEE,
              platformFee: PLATFORM_FEE,
              currency: "BDT",
              status: "pending",
              orderStatus: paymentMethod === codMethod ? "confirmed" : "pending",
              confirmedAt: paymentMethod === codMethod ? now : null,
              gateway: expectedGateway,
              paymentMethod,
              customerPhone,
              customerTransactionId,
              ...(deliveryInfo ? { deliveryInfo } : {}),
            },
          ],
          { session }
        );
        order = createdOrder;
        created = true;
      });
    } finally {
      await session.endSession();
    }

    if (created) revalidatePublicPetListings();
    return Response.json({ orderId: order._id.toString() }, { status: created ? 201 : 200 });
  } catch (error) {
    if (error instanceof OrderRequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Order creation failed:", error.name || "Unknown error");
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Order validation paths:", Object.keys(error.errors).join(", "));
    }
    return Response.json({ error: "Unable to place your order. Please try again." }, { status: 500 });
  }
}
