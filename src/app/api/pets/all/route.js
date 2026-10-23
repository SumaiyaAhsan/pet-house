import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet"; 

export async function GET() {
  try {
    await connectDB();
    // Fetch all pets, newest first, and get the shelter's name too
    const pets = await Pet.find()
      .sort({ createdAt: -1 })
      .populate("listedBy", "name email");
      
    return Response.json(pets);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}