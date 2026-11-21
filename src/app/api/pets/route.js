import connectDB from "@/lib/db";
import Pet from "@/lib/models/Pet";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    // 1. Check if user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== "shelter") {
      return Response.json({ error: "Only shelters can add pets" }, { status: 403 });
    }

    // 2. Get data from frontend
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Invalid pet listing." }, { status: 400 });
    }
    const pet = await Pet.create({
      name: body.name,
      species: body.species,
      breed: body.breed,
      age: body.age,
      gender: body.gender,
      description: body.description,
      healthInfo: typeof body.healthInfo === "string" ? body.healthInfo.slice(0, 2000) : "",
      image: body.image,
      location: body.location,
      price: body.price,
      listedBy: decoded.id,
      status: "pending",
    });

    return Response.json({ message: "Pet added successfully", pet }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}