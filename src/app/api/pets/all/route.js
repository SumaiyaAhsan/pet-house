import connectDB from "@/lib/db";
import Pet from "../../../../lib/models/Pet";
import "../../../../lib/models/User"; 

export async function GET() {
  try {
    await connectDB();
    
    // Fetch ONLY approved pets
    const pets = await Pet.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .populate("listedBy", "name email");
      
    return Response.json(pets);
  } catch (error) {
    console.error("API Error:", error); 
    return Response.json({ error: error.message }, { status: 500 });
  }
}