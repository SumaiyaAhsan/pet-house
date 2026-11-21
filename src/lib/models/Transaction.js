import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    adopterName: { type: String, trim: true, default: "" },
    petName: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true },
    adoptionFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "completed",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
    },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    gateway: {
      type: String,
      enum: ["wallet", "sslcommerz", "free", "manual", "cash_on_delivery"],
      default: "wallet",
    },
    paymentMethod: {
      type: String,
      enum: ["wallet", "free", "bkash", "nagad", "rocket", "cash_on_delivery"],
      default: "wallet",
    },
    customerPhone: { type: String, default: "" },
    customerTransactionId: { type: String, default: "" },
    deliveryInfo: {
      fullName: { type: String, trim: true },
      mobileNumber: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true, default: "" },
      fullAddress: { type: String, trim: true },
      division: { type: String, trim: true },
      district: { type: String, trim: true },
      area: { type: String, trim: true },
      postalCode: { type: String, trim: true, default: "" },
      alternativeContactNumber: { type: String, trim: true, default: "" },
      deliveryInstructions: { type: String, trim: true, default: "" },
    },
    currency: { type: String, default: "BDT" },
    tranId: { type: String, unique: true, sparse: true },
    gatewayPageUrl: { type: String, default: "" },
    gatewayValidationId: { type: String, default: "" },
    gatewayTransactionId: { type: String, default: "" },
  },
  { timestamps: true }
);

transactionSchema.index(
  { pet: 1 },
  {
    unique: true,
    partialFilterExpression: { gateway: "sslcommerz", status: "pending" },
  }
);
transactionSchema.index({ buyer: 1, orderStatus: 1, createdAt: -1 });
transactionSchema.index({ seller: 1, orderStatus: 1, createdAt: -1 });
transactionSchema.index({ status: 1, pet: 1 });
transactionSchema.index({ orderStatus: 1, pet: 1 });
transactionSchema.index({ buyer: 1, createdAt: -1 });
transactionSchema.index({ seller: 1, createdAt: -1 });
transactionSchema.index({ createdAt: -1 });

if (process.env.NODE_ENV === "development" && mongoose.models.Transaction) {
  mongoose.deleteModel("Transaction");
}

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);