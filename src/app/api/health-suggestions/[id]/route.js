import connectDB from "@/lib/db";
import HealthSuggestion from "@/lib/models/HealthSuggestion";
import { verifyToken } from "@/lib/auth";
import { sanitizeSuggestionBody } from "../route";

function getAuthUser(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.split(" ")[1]);
}

// GET /api/health-suggestions/[id] — public detail
export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const suggestion = await HealthSuggestion.findById(id)
      .populate("owner", "name")
      .lean();
    if (!suggestion) {
      return Response.json({ error: "Suggestion not found" }, { status: 404 });
    }
    return Response.json(suggestion);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/health-suggestions/[id] — owner only (own suggestions)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const decoded = getAuthUser(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (decoded.role !== "shelter") {
      return Response.json(
        { error: "Only pet owners can update health suggestions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const suggestion = await HealthSuggestion.findById(id);
    if (!suggestion) {
      return Response.json({ error: "Suggestion not found" }, { status: 404 });
    }
    if (String(suggestion.owner) !== decoded.id) {
      return Response.json(
        { error: "You can only update your own suggestions" },
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

    Object.assign(suggestion, data);
    await suggestion.save();

    return Response.json({ message: "Suggestion updated successfully", suggestion });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/health-suggestions/[id] — owner only (own suggestions)
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const decoded = getAuthUser(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (decoded.role !== "shelter") {
      return Response.json(
        { error: "Only pet owners can delete health suggestions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const suggestion = await HealthSuggestion.findById(id);
    if (!suggestion) {
      return Response.json({ error: "Suggestion not found" }, { status: 404 });
    }
    if (String(suggestion.owner) !== decoded.id) {
      return Response.json(
        { error: "You can only delete your own suggestions" },
        { status: 403 }
      );
    }

    await suggestion.deleteOne();
    return Response.json({ message: "Suggestion deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
