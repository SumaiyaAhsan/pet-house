import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(authHeader.split(" ")[1]);
    const pets = await Pet.find({ listedBy: decoded.id }).sort({ createdAt: -1 });
    
    return Response.json(pets);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}