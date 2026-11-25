import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Message from "@/lib/models/Message";
import { getAuthUser } from "@/lib/chat";

export const runtime = "nodejs";

export async function GET(request) {
  const decoded = getAuthUser(request);
  if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
    return Response.json({ error: "Please sign in to view messages." }, { status: 401 });
  }

  try {
    await connectDB();
    // `readAt: null` also matches legacy messages stored before read tracking existed.
    const unread = await Message.countDocuments({ receiver: decoded.id, readAt: null });
    return Response.json({ unread });
  } catch (error) {
    console.error("Unread count lookup failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to load unread count." }, { status: 500 });
  }
}
