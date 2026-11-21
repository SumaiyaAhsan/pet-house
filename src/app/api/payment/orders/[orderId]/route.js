import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Pet from "@/lib/models/Pet";
import Transaction from "@/lib/models/Transaction";
import { DELIVERY_FEE, PLATFORM_FEE } from "@/lib/payments/fees";

export async function GET(request, { params }) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Please sign in to view this order." }, { status: 401 });
  }

  const decoded = verifyToken(authorization.slice(7));
  if (!decoded) return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });

  const { orderId } = await params;
  if (!mongoose.isValidObjectId(orderId)) {
    return Response.json({ error: "Invalid order." }, { status: 400 });
  }

  try {
    await connectDB();
    const order = await Transaction.findOne({ _id: orderId, buyer: decoded.id })
      .select(
        "_id amount adoptionFee deliveryFee platformFee status orderStatus gateway paymentMethod customerTransactionId deliveryInfo createdAt confirmedAt completedAt cancelledAt pet petName"
      )
      .populate("pet", "name species breed price image updatedAt")
      .lean();

    if (!order) return Response.json({ error: "Order not found." }, { status: 404 });

    const pet = order.pet
      ? {
          _id: order.pet._id,
          name: order.pet.name || order.petName,
          species: order.pet.species,
          breed: order.pet.breed,
          price: order.pet.price,
          image: order.pet.image
            ? `/api/pets/${order.pet._id}/image?v=${order.pet.updatedAt?.getTime() ?? 0}`
            : "",
        }
      : null;

    return Response.json({
      order: {
        _id: order._id,
        amount: order.amount,
        adoptionFee: order.adoptionFee,
        status: order.status,
        orderStatus:
          order.orderStatus || (order.status === "completed" ? "completed" : order.status),
        gateway: order.gateway,
        paymentMethod: order.paymentMethod,
        customerTransactionId: order.customerTransactionId,
        deliveryInfo: order.deliveryInfo,
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt,
        completedAt: order.completedAt,
        cancelledAt: order.cancelledAt,
        deliveryFee: order.deliveryFee ?? DELIVERY_FEE,
        platformFee: order.platformFee ?? PLATFORM_FEE,
        pet,
      },
    });
  } catch (error) {
    console.error("Order lookup failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to load this order." }, { status: 500 });
  }
}
