import connectDB from "@/lib/db";
import Transaction from "../../../../lib/models/Transaction";
import "../../../../lib/models/Pet"; 
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(authHeader.split(" ")[1]);
    
    // Find all transactions where this user is the buyer
    const transactions = await Transaction.find({ buyer: decoded.id })
      .populate("pet")
      .sort({ createdAt: -1 });
      
    return Response.json(transactions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}