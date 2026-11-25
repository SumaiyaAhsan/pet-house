import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ pet: 1, sender: 1, receiver: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, readAt: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models.Message) {
  mongoose.deleteModel("Message");
}

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
