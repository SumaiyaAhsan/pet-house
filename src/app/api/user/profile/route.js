import connectDB from "@/lib/db";
import User from "../../../../lib/models/User";
import Transaction from "../../../../lib/models/Transaction";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(authHeader.slice(7));
    if (!decoded) {
      return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return Response.json({ error: "Your account could not be found. Please sign in again." }, { status: 401 });
    }

    const [totalOrders, confirmedOrders] = await Promise.all([
      Transaction.countDocuments({ buyer: user._id }),
      Transaction.countDocuments({
        buyer: user._id,
        $or: [
          { orderStatus: { $in: ["confirmed", "completed"] } },
          { orderStatus: { $exists: false }, status: "completed" },
        ],
      }),
    ]);

    return Response.json({
      ...user.toObject(),
      totalOrders,
      totalConfirmedOrders: confirmedOrders,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}