import connectDB from "@/lib/db";
import Category from "@/lib/models/Category";

export async function GET() {
  try {
    await connectDB();
    
    // Clear existing to prevent duplicates
    await Category.deleteMany({});

    const categories = [
      { name: "Dog", slug: "dog", icon: "🐕" },
      { name: "Cat", slug: "cat", icon: "🐈" },
      { name: "Bird", slug: "bird", icon: "🦜" },
      { name: "Rabbit", slug: "rabbit", icon: "🐇" },
      { name: "Fish", slug: "fish", icon: "🐠" },
      { name: "Hamster", slug: "hamster", icon: "🐹" },
      { name: "Turtle", slug: "turtle", icon: "🐢" },
      { name: "Other", slug: "other", icon: "🐾" },
    ];

    await Category.insertMany(categories);
    return Response.json({ message: "8 Categories added successfully!" });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}