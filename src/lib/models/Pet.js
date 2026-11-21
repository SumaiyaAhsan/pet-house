import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String, default: "" },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    description: { type: String, default: "" },
    healthInfo: { type: String, default: "" },
    image: { type: String, default: "" }, 
    location: { type: String, required: true },
    price: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "reserved", "adopted"],
      default: "pending",
    },
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

petSchema.index({ status: 1, createdAt: -1 });
petSchema.index({ listedBy: 1, createdAt: -1 });

if (process.env.NODE_ENV === "development" && mongoose.models.Pet) {
  mongoose.deleteModel("Pet");
}

export default mongoose.models.Pet || mongoose.model("Pet", petSchema);