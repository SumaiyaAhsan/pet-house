import connectDB from "@/lib/db";
import Pet from "../../../../../lib/models/Pet";
import sharp from "sharp";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const pet = await Pet.findOne({ _id: id, status: "approved" })
      .select("image")
      .lean();

    if (!pet?.image) {
      return new Response("Image not found", { status: 404 });
    }

    const match = pet.image.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) {
      return new Response("Unsupported image format", { status: 415 });
    }

    const optimizedImage = await sharp(Buffer.from(match[2], "base64"))
      .rotate()
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 76 })
      .toBuffer();

    return new Response(optimizedImage, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Pet image API error:", error);
    return new Response("Unable to load image", { status: 500 });
  }
}
