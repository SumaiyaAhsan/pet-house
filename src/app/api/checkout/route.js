import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "../../../lib/models/User";
import Pet from "../../../lib/models/Pet";
import Transaction from "../../../lib/models/Transaction";
import { verifyToken } from "@/lib/auth";
import { revalidatePublicPetListings } from "@/lib/revalidate-public-pets";

class CheckoutError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function POST(request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decoded = verifyToken(authorization.slice(7));
  if (!decoded) return Response.json({ error: "Invalid token" }, { status: 401 });
  if (decoded.role !== "user") {
    return Response.json({ error: "Only adopters can adopt a pet." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid checkout request." }, { status: 400 });
  }
  if (!mongoose.isValidObjectId(body?.petId)) {
    return Response.json({ error: "Invalid pet listing." }, { status: 400 });
  }

  try {
    await connectDB();
    const session = await mongoose.startSession();
    let order;
    try {
      await session.withTransaction(async () => {
      const buyer = await User.findById(decoded.id).session(session);
      if (!buyer || buyer.status !== "active" || buyer.role !== "user") {
        throw new CheckoutError("Your account cannot make this adoption.", 403);
      }

      const pet = await Pet.findById(body.petId).session(session);
      if (!pet) throw new CheckoutError("Pet not found.", 404);
      if (pet.listedBy.toString() === buyer._id.toString()) {
        throw new CheckoutError("You cannot adopt a pet listed by your account.", 403);
      }
      if (pet.status !== "approved") {
        throw new CheckoutError("This pet is no longer available for adoption.", 409);
      }

      const adoptionFee = Number(pet.price ?? 0);
      if (!Number.isFinite(adoptionFee) || adoptionFee < 0 || buyer.walletBalance < adoptionFee) {
        throw new CheckoutError("Insufficient wallet balance.", 400);
      }

      const seller = await User.findById(pet.listedBy).session(session);
      if (!seller || seller.status !== "active") {
        throw new CheckoutError("The shelter account is unavailable.", 409);
      }

      const adoptedPet = await Pet.findOneAndUpdate(
        { _id: pet._id, status: "approved" },
        { $set: { status: "adopted" } },
        { new: true, session }
      );
      if (!adoptedPet) {
        throw new CheckoutError("This pet is no longer available for adoption.", 409);
      }

      buyer.walletBalance -= adoptionFee;
      seller.walletBalance += adoptionFee;
      await buyer.save({ session });
      await seller.save({ session });

      const now = new Date();
      [order] = await Transaction.create(
        [
          {
            buyer: buyer._id,
            seller: seller._id,
            pet: pet._id,
            adopterName: buyer.name,
            petName: pet.name,
            amount: adoptionFee,
            adoptionFee,
            status: "completed",
            orderStatus: "completed",
            confirmedAt: now,
            completedAt: now,
            gateway: "wallet",
            paymentMethod: "wallet",
            currency: "BDT",
          },
        ],
        { session }
      );
      });

      revalidatePublicPetListings();
      return Response.json({
        message: "Payment successful! You adopted the pet.",
        orderId: order._id.toString(),
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    if (error instanceof CheckoutError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Wallet checkout failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to complete checkout." }, { status: 500 });
  }
}
