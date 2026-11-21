import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }
    
    const decoded = verifyToken(authHeader.slice(7));
    if (!decoded || !decoded.id) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }
    if (decoded.role !== "shelter") {
      return Response.json({ error: "Only shelters can view their listings." }, { status: 403 });
    }

    // Fetch pets listed by this specific user ID
    const pets = await Pet.find({ listedBy: decoded.id })
      .select("name species breed age gender description healthInfo image location price status listedBy createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    
    return Response.json(
      pets.map(({ image, ...pet }) => ({
        ...pet,
        image: image ? `/api/pets/${pet._id}/image?v=${pet.updatedAt?.getTime() ?? 0}` : "",
      }))
    );
  } catch (error) {
    console.error("SHELTER API ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}