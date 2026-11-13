import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }
    
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || !decoded.id) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch pets listed by this specific user ID
    const pets = await Pet.find({ listedBy: decoded.id }).sort({ createdAt: -1 });
    
    return Response.json(pets);
  } catch (error) {
    console.error("SHELTER API ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}