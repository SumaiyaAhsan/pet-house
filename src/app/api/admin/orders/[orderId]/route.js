import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Pet from "@/lib/models/Pet";
import Transaction from "@/lib/models/Transaction";
import { verifyToken } from "@/lib/auth";
import { revalidatePublicPetListings } from "@/lib/revalidate-public-pets";

class OrderActionError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function PATCH(request, { params }) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }
  const decoded = verifyToken(authorization.slice(7));
  if (decoded?.role !== "admin") {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { orderId } = await params;
  if (!mongoose.isValidObjectId(orderId)) {
    return Response.json({ error: "Invalid order." }, { status: 400 });
  }

  let action;
  try {
    ({ action } = await request.json());
  } catch {
    return Response.json({ error: "Invalid order action." }, { status: 400 });
  }
  if (!["confirm", "complete", "cancel"].includes(action)) {
    return Response.json({ error: "Unsupported order action." }, { status: 400 });
  }

  try {
    await connectDB();
    const session = await mongoose.startSession();
    let updatedOrder;
    try {
      await session.withTransaction(async () => {
        const order = await Transaction.findById(orderId).session(session);
        if (!order) throw new OrderActionError("Order not found.", 404);
        const pet = await Pet.findById(order.pet).session(session);
        if (!pet) throw new OrderActionError("The pet linked to this order was not found.", 409);
        const orderStatus =
          order.orderStatus || (order.status === "completed" ? "completed" : "pending");

        if (action === "confirm") {
          if (order.gateway !== "manual" || order.status !== "pending" || orderStatus !== "pending") {
            throw new OrderActionError("Only pending mobile-banking orders can be verified.", 409);
          }
          const adoptedPet = await Pet.findOneAndUpdate(
            { _id: pet._id, status: { $in: ["reserved", "approved"] } },
            { $set: { status: "adopted" } },
            { new: true, session }
          );
          if (!adoptedPet) {
            throw new OrderActionError("This pet is no longer reserved for this order.", 409);
          }
          order.status = "completed";
          order.orderStatus = "confirmed";
          order.confirmedAt = new Date();
        } else if (action === "complete") {
          if (
            order.gateway === "cash_on_delivery" &&
            order.status === "pending" &&
            orderStatus === "confirmed"
          ) {
            const adoptedPet = await Pet.findOneAndUpdate(
              { _id: pet._id, status: "reserved" },
              { $set: { status: "adopted" } },
              { new: true, session }
            );
            if (!adoptedPet) {
              throw new OrderActionError("This pet is no longer reserved for this order.", 409);
            }
            order.status = "completed";
          } else if (order.status !== "completed" || orderStatus !== "confirmed") {
            throw new OrderActionError("This order cannot be marked complete.", 409);
          }
          order.orderStatus = "completed";
          order.completedAt = new Date();
        } else {
          const canCancel =
            order.status === "pending" &&
            ["manual", "cash_on_delivery"].includes(order.gateway) &&
            ["pending", "confirmed"].includes(orderStatus);
          if (!canCancel) {
            throw new OrderActionError("This order can no longer be cancelled.", 409);
          }

          if (pet.status === "reserved") {
            const availablePet = await Pet.findOneAndUpdate(
              { _id: pet._id, status: "reserved" },
              { $set: { status: "approved" } },
              { new: true, session }
            );
            if (!availablePet) {
              throw new OrderActionError("Unable to release the pet for adoption.", 409);
            }
          }
          order.status = "cancelled";
          order.orderStatus = "cancelled";
          order.cancelledAt = new Date();
        }

        await order.save({ session });
        updatedOrder = order;
      });
    } finally {
      await session.endSession();
    }

    revalidatePublicPetListings();
    return Response.json({
      order: {
        _id: updatedOrder._id,
        status: updatedOrder.status,
        orderStatus: updatedOrder.orderStatus,
      },
    });
  } catch (error) {
    if (error instanceof OrderActionError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin order action failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to update this order." }, { status: 500 });
  }
}
