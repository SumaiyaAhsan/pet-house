"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Pill,
  ImagePlus,
  HeartPulse,
  Eye,
  Link2,
  Plus,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { slug: "dog", name: "Dogs" },
  { slug: "cat", name: "Cats" },
  { slug: "bird", name: "Birds" },
  { slug: "rabbit", name: "Rabbits" },
  { slug: "fish", name: "Fish" },
  { slug: "hamster", name: "Hamsters" },
  { slug: "other", name: "Other Pets" },
];

const EMPTY_FORM = {
  category: "dog",
  diseaseName: "",
  image: "",
  description: "",
  symptoms: "",
  causes: "",
  effects: "",
  carePrevention: "",
  medicines: [],
  referenceLinks: [],
};

function readFileAsDataUrl(file, onDone) {
  if (!file || !file.type.startsWith("image/")) {
    toast.error("Please choose an image file");
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => onDone(reader.result);
  reader.onerror = () => toast.error("Failed to read image");
  reader.readAsDataURL(file);
}

export default function ManageHealthSuggestionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    const t = token();
    if (!t) {
      router.replace("/login?next=%2Fpet-care%2Fmanage");
      return;
    }
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${t}` },
        });
        const data = await res.json();
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login?next=%2Fpet-care%2Fmanage");
          return;
        }
        if (!res.ok) throw new Error(data.error || "Unable to load your profile.");
        setUser(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setCheckingAuth(false);
      }
    };
    loadProfile();
  }, [router]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/health-suggestions?mine=1", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load your suggestions.");
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "shelter") loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (s) => {
    setEditingId(s._id);
    setForm({
      category: s.category || "dog",
      diseaseName: s.diseaseName || "",
      image: s.image || "",
      description: s.description || "",
      symptoms: (s.symptoms || []).join(", "),
      causes: s.causes || "",
      effects: s.effects || "",
      carePrevention: s.carePrevention || "",
      medicines: (s.medicines || []).map((m) => ({
        name: m.name || "",
        image: m.image || "",
        description: m.description || "",
      })),
      referenceLinks: (s.referenceLinks || []).map((l) => ({
        label: l.label || "",
        url: l.url || "",
      })),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diseaseName.trim()) {
      toast.error("Disease name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category: form.category,
        diseaseName: form.diseaseName.trim(),
        image: form.image,
        description: form.description,
        symptoms: form.symptoms
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean),
        causes: form.causes,
        effects: form.effects,
        carePrevention: form.carePrevention,
        medicines: form.medicines.filter((m) => m.name.trim()),
        referenceLinks: form.referenceLinks.filter((l) => l.label.trim() && l.url.trim()),
      };

      const url = editingId ? `/api/health-suggestions/${editingId}` : "/api/health-suggestions";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save the suggestion.");
      toast.success(data.message || "Saved successfully");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadSuggestions();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.diseaseName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/health-suggestions/${s._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete the suggestion.");
      toast.success(data.message || "Deleted successfully");
      setSuggestions((prev) => prev.filter((item) => item._id !== s._id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const setMedicine = (index, patch) => {
    setForm((f) => ({
      ...f,
      medicines: f.medicines.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  };

  const setLink = (index, patch) => {
    setForm((f) => ({
      ...f,
      referenceLinks: f.referenceLinks.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
  };

  if (checkingAuth) {
    return (
      <main className="bg-secondary pb-20">
        <div className="section-wrap pt-12">
          <div className="h-8 w-40 animate-pulse rounded-full bg-white" />
          <div className="mt-8 h-64 animate-pulse rounded-[1.75rem] border border-[#ebe7df] bg-white" />
        </div>
      </main>
    );
  }

  // Adopters and admins can view but not manage.
  if (user?.role !== "shelter") {
    return (
      <main className="bg-secondary pb-20">
        <div className="section-wrap pt-12">
          <Link
            href="/pet-care"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-[#FF9B55] hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Pet Care
          </Link>
          <div className="mt-8 rounded-[1.75rem] border border-[#ebe7df] bg-white p-12 text-center">
            <HeartPulse className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h1 className="font-heading text-2xl font-bold text-dark">Owner access only</h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-light">
              Only registered pet owners can create, edit, or delete health care suggestions. You can still
              browse all published suggestions on the Pet Care page.
            </p>
            <Link href="/pet-care" className="btn-primary mt-6">
              Browse health suggestions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-secondary pb-20">
      <div className="section-wrap pt-12">
        <Link
          href="/pet-care"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-[#FF9B55] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Pet Care
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker mb-1">Owner dashboard</p>
            <h1 className="section-heading !text-4xl">Manage health suggestions</h1>
            <p className="mt-2 text-sm text-light">
              Publish and maintain health care suggestions for adopters. New suggestions appear on the Pet
              Care page immediately.
            </p>
          </div>
          <button type="button" onClick={openCreateForm} className="btn-hero-adopt shrink-0">
            <PlusCircle className="h-4 w-4" /> Add New Suggestion
          </button>
        </div>

        {/* Create / edit form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-[1.75rem] border border-[#ebe7df] bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-dark">
                {editingId ? "Edit suggestion" : "Add a new suggestion"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-light transition-colors hover:bg-[#FF9B55] hover:text-black"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-dark">Pet category</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-dark">Disease / health problem name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Skin Infection"
                  value={form.diseaseName}
                  onChange={(e) => setForm({ ...form, diseaseName: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-dark">Cover image (optional)</label>
              <div className="flex items-center gap-4">
                {form.image && (
                  <img
                    src={form.image}
                    alt="Suggestion cover preview"
                    className="h-18 w-18 shrink-0 rounded-xl border-2 border-white object-cover shadow-md"
                  />
                )}
                <label className="btn-secondary cursor-pointer !px-5 !py-2.5 text-sm">
                  <ImagePlus className="h-4 w-4" />
                  {form.image ? "Change image" : "Upload image"}
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => readFileAsDataUrl(e.target.files?.[0], (img) => setForm((f) => ({ ...f, image: img })))}
                  />
                </label>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-dark">Description</label>
              <textarea
                className="input-field min-h-24"
                placeholder="Short description of the disease or health problem"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-dark">
                Common symptoms <span className="font-normal text-light">(separate with commas)</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Itching, Redness, Hair loss"
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-dark">Possible causes</label>
                <textarea
                  className="input-field min-h-24"
                  value={form.causes}
                  onChange={(e) => setForm({ ...form, causes: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-dark">How it affects the pet</label>
                <textarea
                  className="input-field min-h-24"
                  value={form.effects}
                  onChange={(e) => setForm({ ...form, effects: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-dark">Care &amp; prevention</label>
              <textarea
                className="input-field min-h-24"
                placeholder="How owners can care for the pet and prevent this problem"
                value={form.carePrevention}
                onChange={(e) => setForm({ ...form, carePrevention: e.target.value })}
              />
            </div>

            {/* Medicines */}
            <div className="mt-6 rounded-2xl border border-[#ebe7df] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-heading text-base font-bold text-dark">
                  <Pill className="h-4 w-4 text-primary" /> Medicine suggestions
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, medicines: [...f.medicines, { name: "", image: "", description: "" }] }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-dark transition-colors hover:bg-[#FF9B55] hover:text-black"
                >
                  <Plus className="h-3.5 w-3.5" /> Add medicine
                </button>
              </div>
              {form.medicines.length === 0 && (
                <p className="text-sm text-light">No medicines added yet. You can add up to 10.</p>
              )}
              <div className="space-y-4">
                {form.medicines.map((med, index) => (
                  <div key={index} className="rounded-2xl bg-secondary p-4">
                    <div className="flex items-start gap-4">
                      {med.image ? (
                        <img
                          src={med.image}
                          alt="Medicine preview"
                          className="h-14 w-14 shrink-0 rounded-xl border border-[#ebe7df] object-cover"
                        />
                      ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                          <Pill className="h-6 w-6" />
                        </span>
                      )}
                      <div className="grid flex-1 gap-3">
                        <input
                          type="text"
                          className="input-field !py-2.5"
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) => setMedicine(index, { name: e.target.value })}
                        />
                        <textarea
                          className="input-field !py-2.5 min-h-16"
                          placeholder="Basic information about the medicine"
                          value={med.description}
                          onChange={(e) => setMedicine(index, { description: e.target.value })}
                        />
                        <div className="flex items-center gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#d6d3cd] bg-white px-4 py-2 text-xs font-semibold text-dark transition-colors hover:border-[#FF9B55] hover:bg-[#FF9B55]">
                            <ImagePlus className="h-3.5 w-3.5" />
                            {med.image ? "Change picture" : "Medicine picture"}
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) =>
                                readFileAsDataUrl(e.target.files?.[0], (img) => setMedicine(index, { image: img }))
                              }
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({ ...f, medicines: f.medicines.filter((_, i) => i !== index) }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference links */}
            <div className="mt-6 rounded-2xl border border-[#ebe7df] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-heading text-base font-bold text-dark">
                  <Link2 className="h-4 w-4 text-primary" /> Reference links (optional)
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, referenceLinks: [...f.referenceLinks, { label: "", url: "" }] }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-dark transition-colors hover:bg-[#FF9B55] hover:text-black"
                >
                  <Plus className="h-3.5 w-3.5" /> Add link
                </button>
              </div>
              <div className="space-y-3">
                {form.referenceLinks.map((link, index) => (
                  <div key={index} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      className="input-field !py-2.5 sm:w-1/3"
                      placeholder="Link label"
                      value={link.label}
                      onChange={(e) => setLink(index, { label: e.target.value })}
                    />
                    <input
                      type="url"
                      className="input-field !py-2.5 sm:flex-1"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => setLink(index, { url: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, referenceLinks: f.referenceLinks.filter((_, i) => i !== index) }))
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                ))}
                {form.referenceLinks.length === 0 && (
                  <p className="text-sm text-light">
                    A Google search link is always added automatically on the detail page. Add extra links only
                    if you want to point adopters to specific resources.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving..." : editingId ? "Update suggestion" : "Publish suggestion"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Published suggestions */}
        <div className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-bold text-dark">
            Published suggestions ({suggestions.length})
          </h2>
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-[1.75rem] border border-[#ebe7df] bg-white" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="rounded-[1.75rem] border border-[#ebe7df] bg-white p-12 text-center">
              <HeartPulse className="mx-auto mb-4 h-10 w-10 text-primary" />
              <p className="font-heading text-lg font-bold text-dark">No suggestions yet</p>
              <p className="mt-2 text-sm text-light">
                Click &quot;Add New Suggestion&quot; to publish your first health care tip.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {suggestions.map((s) => (
                <div
                  key={s._id}
                  className="flex flex-col gap-4 rounded-[1.75rem] border border-[#ebe7df] bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.diseaseName}
                      className="h-16 w-16 shrink-0 rounded-2xl border border-[#ebe7df] object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <HeartPulse className="h-7 w-7" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-base font-bold text-dark">{s.diseaseName}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#df531a]">
                      {CATEGORY_OPTIONS.find((c) => c.slug === s.category)?.name || s.category}
                    </p>
                    {s.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-light">{s.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/pet-care/${s.category}/${s._id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#d6d3cd] bg-white px-4 py-2 text-xs font-semibold text-dark transition-colors hover:border-[#FF9B55] hover:bg-[#FF9B55]"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditForm(s)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#111214] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#FF9B55] hover:text-black"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
