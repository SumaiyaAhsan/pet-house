import connectDB from "@/lib/db";
import Transaction from "../../../../lib/models/Transaction";
import "../../../../lib/models/Pet";
import "../../../../lib/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decoded = verifyToken(authorization.slice(7));
  if (!decoded) return Response.json({ error: "Invalid token" }, { status: 401 });
  if (decoded.role !== "shelter") {
    return Response.json({ error: "Only shelters can view their orders." }, { status: 403 });
  }

  try {
    await connectDB();
    const transactions = await Transaction.find({ seller: decoded.id })
      .select(
        "_id buyer pet petName amount status orderStatus gateway paymentMethod deliveryInfo createdAt confirmedAt completedAt"
      )
      .populate("buyer", "name")
      .populate("pet", "name")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(
      transactions.map((order) => ({
        ...order,
        adopterName: order.buyer?.name || "Adopter",
        petName: order.pet?.name || order.petName || "Pet",
        orderStatus: order.orderStatus || (order.status === "completed" ? "completed" : order.status),
        deliveryInfo:
          ["confirmed", "completed"].includes(order.orderStatus) ||
          (!order.orderStatus && order.status === "completed")
            ? order.deliveryInfo
            : null,
      }))
    );
  } catch (error) {
    console.error("Shelter orders lookup failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to load shelter orders." }, { status: 500 });
  }
}
