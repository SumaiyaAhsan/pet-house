import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: {
      type: String,
      enum: ["Grooming", "Boarding", "Vet Visit"],
      required: true,
    },
    petName: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    price: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);