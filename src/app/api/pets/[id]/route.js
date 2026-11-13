import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import "../../../../lib/models/User"; 
import { verifyToken } from "@/lib/auth";

// Helper to get ID from URL
function getIdFromUrl(req) {
  const urlParts = req.url.split("/");
  return urlParts[urlParts.length - 1];
}

export async function GET(req) {
  try {
    await connectDB();
    const id = getIdFromUrl(req);
    
    const pet = await Pet.findById(id).populate("listedBy", "name email phone");
    if (!pet) return Response.json({ error: "Pet not found" }, { status: 404 });
    
    return Response.json(pet);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) return Response.json({ error: "Invalid token" }, { status: 401 });

    const id = getIdFromUrl(req);
    const pet = await Pet.findById(id);
    
    if (!pet) return Response.json({ error: "Pet not found" }, { status: 404 });
    
    // Check ownership
    if (pet.listedBy.toString() !== decoded.id && decoded.role !== "admin") {
      return Response.json({ error: "You can only edit your own pets" }, { status: 403 });
    }

    const body = await req.json();
    const updatedPet = await Pet.findByIdAndUpdate(id, body, { new: true });
    
    return Response.json({ message: "Updated successfully", pet: updatedPet });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}