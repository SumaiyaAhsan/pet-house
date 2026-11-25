import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Message from "@/lib/models/Message";
import Pet from "@/lib/models/Pet";
import User from "@/lib/models/User";
import { getAuthUser, getChatParticipants } from "@/lib/chat";

export const runtime = "nodejs";

function serializeConversation({ petDoc, petId, other, group }) {
  const resolvedPetId = petDoc ? petDoc._id.toString() : petId;
  return {
    pet: petDoc
      ? {
          id: resolvedPetId,
          name: petDoc.name,
          status: petDoc.status,
          image: `/api/pets/${resolvedPetId}/image`,
        }
      : { id: resolvedPetId, name: "Pet no longer listed", status: "", image: "" },
    user: {
      id: other._id.toString(),
      name: other.name,
      role: other.role,
      avatar: other.avatar || "",
    },
    lastMessage: group
      ? {
          text: group.lastText,
          createdAt: group.lastAt,
          senderId: group.lastSender.toString(),
        }
      : null,
    unreadCount: group ? group.unreadCount : 0,
    updatedAt: group ? group.lastAt : null,
  };
}

export async function GET(request) {
  const decoded = getAuthUser(request);
  if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
    return Response.json({ error: "Please sign in to view messages." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const petParam = searchParams.get("pet");
  const toParam = searchParams.get("to");
  if (
    (petParam && !mongoose.isValidObjectId(petParam)) ||
    (toParam && !mongoose.isValidObjectId(toParam))
  ) {
    return Response.json({ error: "Invalid conversation filter." }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findById(decoded.id).select("_id name role status").lean();
    if (!user || user.status !== "active") {
      return Response.json({ error: "Your account is not available for messaging." }, { status: 403 });
    }

    const me = new mongoose.Types.ObjectId(decoded.id);

    // One conversation per (pet, other user) pair — every pet keeps its own thread.
    const grouped = await Message.aggregate([
      { $match: { $or: [{ sender: me }, { receiver: me }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            pet: "$pet",
            other: { $cond: [{ $eq: ["$sender", me] }, "$receiver", "$sender"] },
          },
          lastText: { $first: "$text" },
          lastAt: { $first: "$createdAt" },
          lastSender: { $first: "$sender" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", me] }, { $eq: ["$readAt", null] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    const petIds = [...new Set(grouped.map((entry) => entry._id.pet.toString()))];
    const userIds = [...new Set(grouped.map((entry) => entry._id.other.toString()))];

    const [pets, others] = await Promise.all([
      petIds.length
        ? Pet.find({ _id: { $in: petIds } }).select("_id name status").lean()
        : [],
      userIds.length
        ? User.find({ _id: { $in: userIds } }).select("_id name role avatar status").lean()
        : [],
    ]);

    const petMap = new Map(pets.map((pet) => [pet._id.toString(), pet]));
    const userMap = new Map(others.map((other) => [other._id.toString(), other]));

    const conversations = [];
    for (const group of grouped) {
      const other = userMap.get(group._id.other.toString());
      if (!other) continue; // account removed — skip the conversation
      conversations.push(
        serializeConversation({
          petDoc: petMap.get(group._id.pet.toString()),
          petId: group._id.pet.toString(),
          other,
          group,
        })
      );
    }

    // Deep link (?pet=&to=): expose a ready-to-use conversation even before the
    // first message exists, as long as messaging this pair is allowed.
    if (
      petParam &&
      toParam &&
      !conversations.some((conv) => conv.pet.id === petParam && conv.user.id === toParam)
    ) {
      const [petDoc, other] = await Promise.all([
        Pet.findById(petParam).select("_id name status listedBy").lean(),
        User.findById(toParam).select("_id name role avatar status").lean(),
      ]);
      if (petDoc && other && other.status === "active" && other._id.toString() !== decoded.id) {
        const allowed = await getChatParticipants(petDoc, user);
        if (allowed.includes(toParam)) {
          conversations.unshift(
            serializeConversation({ petDoc, petId: petParam, other, group: null })
          );
        }
      }
    }

    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    return Response.json({ conversations, totalUnread });
  } catch (error) {
    console.error("Conversation lookup failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to load conversations." }, { status: 500 });
  }
}
