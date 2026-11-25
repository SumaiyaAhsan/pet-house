import connectDB from "@/lib/db";
import HealthSuggestion from "@/lib/models/HealthSuggestion";
import User from "@/lib/models/User";
import { hashPassword } from "@/lib/auth";

// GET /api/health-suggestions/seed
// Seeds sample pet health suggestions (safe to call repeatedly; skips if data exists).
export async function GET() {
  try {
    await connectDB();

    const existing = await HealthSuggestion.countDocuments();
    if (existing > 0) {
      return Response.json({ message: `Health suggestions already seeded (${existing} found).` });
    }

    // Attach suggestions to an existing shelter account, or create a demo care team account.
    let owner = await User.findOne({ role: "shelter" }).select("_id").lean();
    if (!owner) {
      owner = await User.create({
        name: "Pet House Care Team",
        email: "careteam@pethouse.local",
        password: await hashPassword("careteam-demo-123"),
        role: "shelter",
      });
    }

    const samples = [
      {
        category: "dog",
        diseaseName: "Skin Infection",
        description:
          "Bacterial or fungal skin infections are common in dogs and cause redness, itching, and hair loss.",
        symptoms: ["Itching and scratching", "Red or inflamed skin", "Hair loss", "Bad odor"],
        causes: "Allergies, parasites, moisture trapped in the coat, or scratches that become infected.",
        effects: "Untreated infections can spread, cause open sores, and make the dog restless and uncomfortable.",
        carePrevention: "Keep the coat clean and dry, groom regularly, and check the skin during baths.",
        medicines: [
          {
            name: "Medicated Antiseptic Shampoo",
            image: "",
            description: "Used for bathing to reduce bacteria and soothe irritated skin.",
          },
        ],
      },
      {
        category: "dog",
        diseaseName: "Diarrhea",
        description:
          "Loose or watery stools in dogs, usually caused by diet changes, infections, or stress.",
        symptoms: ["Frequent loose stools", "Lethargy", "Loss of appetite", "Dehydration"],
        causes: "Sudden food changes, eating spoiled food, parasites, or viral infections.",
        effects: "Prolonged diarrhea leads to dehydration and weakness, which is dangerous for puppies.",
        carePrevention: "Feed a consistent diet, avoid table scraps, and keep vaccinations up to date.",
        medicines: [
          {
            name: "Oral Rehydration Solution",
            image: "",
            description: "Helps replace lost fluids and electrolytes. Ask a vet about proper use.",
          },
        ],
      },
      {
        category: "dog",
        diseaseName: "Ear Infection",
        description:
          "Inflammation of the ear canal, often seen in dogs with floppy ears or frequent swimming.",
        symptoms: ["Head shaking", "Scratching the ears", "Redness inside the ear", "Discharge or odor"],
        causes: "Bacteria, yeast, ear mites, or trapped moisture.",
        effects: "Chronic ear infections can damage the ear canal and affect hearing and balance.",
        carePrevention: "Dry ears after baths or swimming and clean them with a vet-approved solution.",
        medicines: [
          {
            name: "Vet-Prescribed Ear Drops",
            image: "",
            description: "Antibiotic or antifungal drops chosen after a vet examines the ear.",
          },
        ],
      },
      {
        category: "cat",
        diseaseName: "Respiratory Infection",
        description:
          "Cat flu and other upper respiratory infections spread easily between cats.",
        symptoms: ["Sneezing", "Runny nose and eyes", "Fever", "Reduced appetite"],
        causes: "Viral infections such as feline herpesvirus or calicivirus, often from contact with sick cats.",
        effects: "Kittens and older cats can develop pneumonia or stop eating, which becomes serious quickly.",
        carePrevention: "Vaccinate on schedule and keep new cats separated until they are checked by a vet.",
        medicines: [
          {
            name: "Vet-Prescribed Antibiotics",
            image: "",
            description: "Used only when a vet confirms a secondary bacterial infection.",
          },
        ],
      },
      {
        category: "cat",
        diseaseName: "Ringworm",
        description:
          "A contagious fungal infection of the skin that can also spread to humans.",
        symptoms: ["Circular bald patches", "Scaly or crusty skin", "Mild itching"],
        causes: "Contact with infected animals or contaminated bedding and brushes.",
        effects: "Lesions spread over the body and can infect other pets and people in the home.",
        carePrevention: "Isolate infected cats, wash bedding, and disinfect grooming tools.",
        medicines: [
          {
            name: "Antifungal Cream or Shampoo",
            image: "",
            description: "Applied to lesions as directed by a veterinarian.",
          },
        ],
      },
      {
        category: "bird",
        diseaseName: "Respiratory Infection",
        description:
          "Birds hide illness well, so breathing problems often appear only when the disease is advanced.",
        symptoms: ["Tail bobbing while breathing", "Clicking sounds", "Fluffed feathers", "Nasal discharge"],
        causes: "Drafts, poor ventilation, vitamin A deficiency, or bacterial and fungal infections.",
        effects: "Breathing difficulty can become life-threatening in birds within a short time.",
        carePrevention: "Keep the cage away from drafts, provide a balanced diet, and clean the cage regularly.",
        medicines: [
          {
            name: "Avian Vet-Prescribed Antibiotics",
            image: "",
            description: "Must be prescribed by an avian veterinarian after examination.",
          },
        ],
      },
    ];

    await HealthSuggestion.insertMany(samples.map((s) => ({ ...s, owner: owner._id })));
    return Response.json({ message: `${samples.length} sample health suggestions added successfully!` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
