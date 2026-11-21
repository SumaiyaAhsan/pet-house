import connectDB from "@/lib/db";
import Transaction from "../../../../lib/models/Transaction";
import "../../../../lib/models/Pet"; 
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const decoded = verifyToken(authHeader.slice(7));
    if (!decoded) return Response.json({ error: "Invalid token" }, { status: 401 });
    if (decoded.role !== "user") {
      return Response.json({ error: "Only adopters can view adoption history." }, { status: 403 });
    }
    
    const transactions = await Transaction.find({ buyer: decoded.id })
      .select(
        "_id pet petName amount adoptionFee deliveryFee platformFee status orderStatus gateway paymentMethod createdAt confirmedAt completedAt cancelledAt"
      )
      .populate("pet", "name species breed age gender price status updatedAt image")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(
      transactions.map((transaction) => {
        let pet = null;
        if (transaction.pet) {
          const { image, ...petData } = transaction.pet;
          pet = {
            ...petData,
            image: image
              ? `/api/pets/${petData._id}/image?v=${petData.updatedAt?.getTime() ?? 0}`
              : "",
          };
        }

        return {
          ...transaction,
          orderStatus:
            transaction.orderStatus ||
            (transaction.status === "completed" ? "completed" : transaction.status),
          pet,
        };
      })
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}