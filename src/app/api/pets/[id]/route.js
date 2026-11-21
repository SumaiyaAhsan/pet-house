import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import "../../../../lib/models/User"; 
import { verifyToken } from "@/lib/auth";
import { getPublicPetFilter } from "@/lib/public-pets";

// Helper to get ID from URL
function getIdFromUrl(req) {
  const urlParts = new URL(req.url).pathname.split("/");
  return urlParts[urlParts.length - 1];
}

export async function GET(req) {
  try {
    await connectDB();
    const id = getIdFromUrl(req);
    const optimized = new URL(req.url).searchParams.get("optimized") === "1";
    let query;
    if (optimized) {
      query = Pet.findOne(await getPublicPetFilter({ _id: id })).select("-image");
    } else {
      query = Pet.findById(id);
    }

    const pet = await query.populate("listedBy", "name email phone").lean();
    if (!pet) return Response.json({ error: "Pet not found" }, { status: 404 });

    if (optimized) {
      return Response.json({
        ...pet,
        image: `/api/pets/${pet._id}/image?v=${pet.updatedAt?.getTime() ?? 0}`,
      });
    }

    return Response.json(pet);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = verifyToken(authHeader.slice(7));
    if (!decoded) return Response.json({ error: "Invalid token" }, { status: 401 });

    const id = getIdFromUrl(req);
    const pet = await Pet.findById(id);
    
    if (!pet) return Response.json({ error: "Pet not found" }, { status: 404 });
    
    // Check ownership
    if (pet.listedBy.toString() !== decoded.id && decoded.role !== "admin") {
      return Response.json({ error: "You can only edit your own pets" }, { status: 403 });
    }

    if (["reserved", "adopted"].includes(pet.status)) {
      return Response.json({ error: "Reserved or adopted pet details cannot be edited." }, { status: 409 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Invalid pet update." }, { status: 400 });
    }
    const allowedFields = [
      "name",
      "species",
      "breed",
      "age",
      "gender",
      "description",
      "healthInfo",
      "image",
      "location",
      "price",
    ];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => Object.hasOwn(body, field))
        .map((field) => [
          field,
          field === "healthInfo" && typeof body[field] === "string"
            ? body[field].slice(0, 2000)
            : body[field],
        ])
    );
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: id, listedBy: pet.listedBy, status: { $nin: ["reserved", "adopted"] } },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedPet) {
      return Response.json({ error: "This pet can no longer be edited." }, { status: 409 });
    }
    
    return Response.json({ message: "Updated successfully", pet: updatedPet });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}