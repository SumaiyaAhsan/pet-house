import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
// We import the User model here so Mongoose knows how to populate 'listedBy'
import "../../../../lib/models/User"; 

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all pets
    const pets = await Pet.find().sort({ createdAt: -1 }).populate("listedBy", "name email");
      
    return Response.json(pets);
  } catch (error) {
    console.error("API Error:", error); // This will print the exact error in your terminal
    return Response.json({ error: error.message }, { status: 500 });
  }
}