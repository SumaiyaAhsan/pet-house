import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import "../../../../lib/models/User"; 
import { verifyToken } from "@/lib/auth";

function getAdmin(req) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const decoded = verifyToken(authorization.slice(7));
  return decoded?.role === "admin" ? decoded : null;
}

export async function GET(req) {
  if (!getAdmin(req)) return Response.json({ error: "Admin access required." }, { status: 403 });

  try {
    await connectDB();
    const pets = await Pet.find()
      .select("name species breed status listedBy createdAt")
      .sort({ createdAt: -1 })
      .populate("listedBy", "name")
      .lean();
    return Response.json(pets);
  } catch (error) {
    console.error("Admin pet listings failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to load pet listings." }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!getAdmin(req)) return Response.json({ error: "Admin access required." }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Invalid pet review action." }, { status: 400 });
    }
    const { petId, status } = body;
    if (!petId || !["approved", "rejected"].includes(status)) {
      return Response.json({ error: "Invalid pet review action." }, { status: 400 });
    }

    const updatedPet = await Pet.findOneAndUpdate(
      { _id: petId, status: "pending" },
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!updatedPet) {
      return Response.json({ error: "This pet is no longer awaiting review." }, { status: 409 });
    }
    return Response.json({ message: `Pet ${status} successfully`, pet: updatedPet });
  } catch (error) {
    console.error("Admin pet review failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to update this pet listing." }, { status: 500 });
  }
}