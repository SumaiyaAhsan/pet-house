import Message from "@/lib/models/Message";
import Transaction from "@/lib/models/Transaction";
import { verifyToken } from "@/lib/auth";

// Extract and verify the Bearer token from a request.
export function getAuthUser(request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return verifyToken(authorization.slice(7));
}

// Returns the list of user ids the given user is allowed to message about this pet.
export async function getChatParticipants(pet, user) {
  const ownerId = pet.listedBy.toString();
  const userId = user._id.toString();

  if (user.role === "user") {
    const hasOrder = await Transaction.exists({ pet: pet._id, buyer: user._id });
    return pet.status === "approved" || hasOrder ? [ownerId] : [];
  }

  if (user.role === "shelter" && userId !== ownerId) return [];
  if (user.role !== "shelter" && user.role !== "admin") return [];

  const [buyerIds, messageSenders, messageReceivers] = await Promise.all([
    Transaction.distinct("buyer", { pet: pet._id }),
    Message.distinct("sender", { pet: pet._id }),
    Message.distinct("receiver", { pet: pet._id }),
  ]);
  const participantIds = new Set([ownerId]);

  for (const id of [...buyerIds, ...messageSenders, ...messageReceivers]) {
    participantIds.add(id.toString());
  }
  participantIds.delete(userId);

  return [...participantIds];
}
