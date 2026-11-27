import connectDB from "@/lib/db";
import Pet from "@/lib/models/Pet";
import sharp from "sharp";

// Cache optimized images in server memory so repeat requests skip
// the database query and sharp processing entirely.
const imageCache = global.petImageCache || (global.petImageCache = new Map());

const IMAGE_HEADERS = {
  "Content-Type": "image/webp",
  "Cache-Control": "public, max-age=31536000, immutable",
};

export async function GET(_request, { params }) {
  try {
    const { id } = await params;

    // Fast path: serve from memory cache when the URL version matches.
    const url = new URL(_request.url);
    const version = url.searchParams.get("v") || "";
    const cacheKey = `${id}:${version}`;
    if (imageCache.has(cacheKey)) {
      return new Response(imageCache.get(cacheKey), { headers: IMAGE_HEADERS });
    }

    await connectDB();
    const pet = await Pet.findOne({ _id: id, status: { $in: ["approved", "reserved", "adopted"] } })
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

    // Keep the cache small: store at most 200 images (~200 x 15 KB is fine).
    if (imageCache.size >= 200) imageCache.clear();
    imageCache.set(cacheKey, optimizedImage);

    return new Response(optimizedImage, { headers: IMAGE_HEADERS });
  } catch (error) {
    console.error("Pet image API error:", error);
    return new Response("Unable to load image", { status: 500 });
  }
}
