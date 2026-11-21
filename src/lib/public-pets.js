import Transaction from "@/lib/models/Transaction";

export async function getPublicPetFilter(criteria = {}) {
  const { _id, ...otherCriteria } = criteria;
  const unavailablePetIds = await Transaction.distinct("pet", {
    $or: [
      { status: { $in: ["pending", "completed"] } },
      { orderStatus: { $in: ["confirmed", "completed"] } },
    ],
  });

  return {
    ...otherCriteria,
    status: "approved",
    _id: {
      $nin: unavailablePetIds,
      ...(_id ? { $eq: _id } : {}),
    },
  };
}
