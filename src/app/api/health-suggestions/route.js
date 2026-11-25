import connectDB from "@/lib/db";
import HealthSuggestion, { PET_CARE_CATEGORIES } from "@/lib/models/HealthSuggestion";
import { verifyToken } from "@/lib/auth";

const VALID_CATEGORIES = PET_CARE_CATEGORIES.map((c) => c.slug);

function getAuthUser(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.split(" ")[1]);
}

function sanitizeList(value, maxItems = 20, maxLength = 300) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxLength));
}

function sanitizeMedicines(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((med) => med && typeof med === "object" && typeof med.name === "string" && med.name.trim())
    .slice(0, 10)
    .map((med) => ({
      name: med.name.trim().slice(0, 120),
      image: typeof med.image === "string" ? med.image : "",
      description: typeof med.description === "string" ? med.description.slice(0, 1000) : "",
    }));
}

function sanitizeLinks(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (link) =>
        link &&
        typeof link === "object" &&
        typeof link.label === "string" &&
        link.label.trim() &&
        typeof link.url === "string" &&
        /^https?:\/\//i.test(link.url.trim())
    )
    .slice(0, 10)
    .map((link) => ({
      label: link.label.trim().slice(0, 120),
      url: link.url.trim().slice(0, 500),
    }));
}

export function sanitizeSuggestionBody(body) {
  return {
    category: VALID_CATEGORIES.includes(body.category) ? body.category : null,
    diseaseName: typeof body.diseaseName === "string" ? body.diseaseName.trim().slice(0, 150) : "",
    description: typeof body.description === "string" ? body.description.slice(0, 4000) : "",
    symptoms: sanitizeList(body.symptoms),
    causes: typeof body.causes === "string" ? body.causes.slice(0, 2000) : "",
    effects: typeof body.effects === "string" ? body.effects.slice(0, 2000) : "",
    carePrevention: typeof body.carePrevention === "string" ? body.carePrevention.slice(0, 4000) : "",
    medicines: sanitizeMedicines(body.medicines),
    referenceLinks: sanitizeLinks(body.referenceLinks),
    image: typeof body.image === "string" ? body.image : "",
  };
}

// GET /api/health-suggestions
// Public: ?category=dog&search=skin
// Owner:  ?mine=1 (requires shelter token)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = (searchParams.get("search") || "").trim();
    const mine = searchParams.get("mine");

    const filter = {};

    if (mine === "1") {
      const decoded = getAuthUser(req);
      if (!decoded) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (decoded.role !== "shelter") {
        return Response.json({ error: "Only pet owners can manage health suggestions" }, { status: 403 });
      }
      filter.owner = decoded.id;
    } else if (category && VALID_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 80), "i");
      filter.$or = [{ diseaseName: rx }, { description: rx }, { symptoms: rx }];
    }

    const suggestions = await HealthSuggestion.find(filter)
      .populate("owner", "name")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(suggestions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/health-suggestions — owner (shelter) only
export async function POST(req) {
  try {
    await connectDB();

    const decoded = getAuthUser(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (decoded.role !== "shelter") {
      return Response.json(
        { error: "Only pet owners can publish health suggestions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Invalid suggestion." }, { status: 400 });
    }

    const data = sanitizeSuggestionBody(body);
    if (!data.category || !data.diseaseName) {
      return Response.json(
        { error: "Pet category and disease name are required." },
        { status: 400 }
      );
    }

    const suggestion = await HealthSuggestion.create({ ...data, owner: decoded.id });
    return Response.json(
      { message: "Health suggestion published successfully", suggestion },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
