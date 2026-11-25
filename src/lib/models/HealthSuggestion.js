import mongoose from "mongoose";

export const PET_CARE_CATEGORIES = [
  { slug: "dog", name: "Dogs", icon: "dog" },
  { slug: "cat", name: "Cats", icon: "cat" },
  { slug: "bird", name: "Birds", icon: "bird" },
  { slug: "rabbit", name: "Rabbits", icon: "rabbit" },
  { slug: "fish", name: "Fish", icon: "fish" },
  { slug: "hamster", name: "Hamsters", icon: "hamster" },
  { slug: "other", name: "Other Pets", icon: "paw" },
];

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const referenceLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const healthSuggestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: PET_CARE_CATEGORIES.map((c) => c.slug),
      required: true,
      index: true,
    },
    diseaseName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    symptoms: { type: [String], default: [] },
    causes: { type: String, default: "" },
    effects: { type: String, default: "" },
    carePrevention: { type: String, default: "" },
    medicines: { type: [medicineSchema], default: [] },
    referenceLinks: { type: [referenceLinkSchema], default: [] },
    image: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

healthSuggestionSchema.index({ category: 1, createdAt: -1 });
healthSuggestionSchema.index({ owner: 1, createdAt: -1 });

if (process.env.NODE_ENV === "development" && mongoose.models.HealthSuggestion) {
  mongoose.deleteModel("HealthSuggestion");
}

export default mongoose.models.HealthSuggestion ||
  mongoose.model("HealthSuggestion", healthSuggestionSchema);
