import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import "../../../../lib/models/User"; 

export async function GET(req) {
  try {
    await connectDB();
    
    // Read the 'id' from the URL query parameters (?id=12345)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return Response.json({ error: "Pet ID is required" }, { status: 400 });
    }

    const pet = await Pet.findById(id).populate("listedBy", "name email phone");
    
    if (!pet) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }
    
    return Response.json(pet);
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}