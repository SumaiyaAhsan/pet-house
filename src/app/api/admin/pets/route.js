import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import "../../../../lib/models/User"; 
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const pets = await Pet.find().sort({ createdAt: -1 }).populate("listedBy", "name email");
    return Response.json(pets);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "admin") {
      return Response.json({ error: "Only admins can do this" }, { status: 403 });
    }

    const body = await req.json();
    const { petId, status } = body;

    const updatedPet = await Pet.findByIdAndUpdate(petId, { status }, { new: true });
    return Response.json({ message: `Pet ${status} successfully`, pet: updatedPet });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}