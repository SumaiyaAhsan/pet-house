import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import "../../../../lib/models/User"; 

export async function GET(request) {
  try {
    await connectDB();

    const searchParams = new URL(request.url).searchParams;
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      24,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "12", 10) || 12)
    );
    const search = searchParams.get("search")?.trim();
    const species = searchParams.get("species")?.trim();
    const filter = { status: "approved" };

    if (species && species.toLowerCase() !== "all") {
      filter.species = new RegExp(`^${species.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { species: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const [pets, total] = await Promise.all([
      Pet.find(filter)
        .select("name species breed age gender location price status listedBy createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("listedBy", "name")
        .lean(),
      Pet.countDocuments(filter),
    ]);

    return Response.json({
      pets: pets.map((pet) => ({
        ...pet,
        image: `/api/pets/${pet._id}/image?v=${pet.updatedAt?.getTime() ?? 0}`,
      })),
      total,
      page,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("API Error:", error); 
    return Response.json({ error: error.message }, { status: 500 });
  }
}