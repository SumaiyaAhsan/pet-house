import connectDB from "@/lib/db";
import Pet from "@/lib/models/Pet";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";

function isAdmin(request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  return verifyToken(authorization.slice(7))?.role === "admin";
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    await connectDB();

    const [
      totalUsers,
      totalAdopters,
      totalShelters,
      totalPets,
      totalAvailablePets,
      totalReservedPets,
      totalAdoptedPets,
      orderTotals,
      userOrderCounts,
      recentOrders,
      recentPets,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "shelter" }),
      Pet.countDocuments(),
      Pet.countDocuments({ status: "approved" }),
      Pet.countDocuments({ status: "reserved" }),
      Pet.countDocuments({ status: "adopted" }),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalConfirmedOrders: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $in: ["$orderStatus", ["confirmed", "completed"]] },
                      { $and: [{ $eq: [{ $ifNull: ["$orderStatus", null] }, null] }, { $eq: ["$status", "completed"] }] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalCompletedOrders: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$orderStatus", "completed"] },
                      { $and: [{ $eq: [{ $ifNull: ["$orderStatus", null] }, null] }, { $eq: ["$status", "completed"] }] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalCancelledOrders: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ["$orderStatus", "cancelled"] }, { $eq: ["$status", "cancelled"] }] },
                  1,
                  0,
                ],
              },
            },
            totalPendingOrders: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$orderStatus", "pending"] },
                      { $and: [{ $eq: [{ $ifNull: ["$orderStatus", null] }, null] }, { $eq: ["$status", "pending"] }] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0] } },
            totalPlatformFeesCollected: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, { $ifNull: ["$platformFee", 0] }, 0] },
            },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: "$buyer",
            totalOrders: { $sum: 1 },
            confirmedOrders: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $in: ["$orderStatus", ["confirmed", "completed"]] },
                      { $and: [{ $eq: [{ $ifNull: ["$orderStatus", null] }, null] }, { $eq: ["$status", "completed"] }] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Transaction.find()
        .select(
          "_id buyer pet adopterName petName gateway paymentMethod amount status orderStatus customerPhone customerTransactionId createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("buyer", "name")
        .populate("pet", "name")
        .lean(),
      Pet.find()
        .select("name species price status listedBy createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("listedBy", "name")
        .lean(),
      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const orderCountByUser = new Map(
      userOrderCounts.map((record) => [record._id?.toString(), record])
    );
    const stats = orderTotals[0] || {};

    return Response.json({
      stats: {
        totalUsers,
        totalAdopters,
        totalShelters,
        totalPets,
        totalAvailablePets,
        totalReservedPets,
        totalAdoptedPets,
        totalConfirmedOrders: stats.totalConfirmedOrders || 0,
        totalCompletedOrders: stats.totalCompletedOrders || 0,
        totalCancelledOrders: stats.totalCancelledOrders || 0,
        totalPendingOrders: stats.totalPendingOrders || 0,
        totalRevenue: stats.totalRevenue || 0,
        totalPlatformFeesCollected: stats.totalPlatformFeesCollected || 0,
      },
      recentOrders: recentOrders.map((order) => ({
        ...order,
        adopterName: order.buyer?.name || order.adopterName || "Adopter",
        petName: order.pet?.name || order.petName || "Pet",
        orderStatus:
          order.orderStatus || (order.status === "completed" ? "completed" : order.status),
      })),
      recentPets,
      recentUsers: recentUsers.map((user) => {
        const orderCounts = orderCountByUser.get(user._id.toString());
        return {
          ...user,
          totalOrders: orderCounts?.totalOrders || 0,
          confirmedOrders: orderCounts?.confirmedOrders || 0,
        };
      }),
    });
  } catch (error) {
    console.error("Admin overview failed:", error.name || "Unknown error");
    return Response.json({ error: "Unable to load platform overview." }, { status: 500 });
  }
}
