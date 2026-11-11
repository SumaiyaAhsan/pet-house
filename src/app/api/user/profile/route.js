import connectDB from "@/lib/db";
import User from "../../../../lib/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(authHeader.split(" ")[1]);
    const user = await User.findById(decoded.id).select("-password");
    
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}