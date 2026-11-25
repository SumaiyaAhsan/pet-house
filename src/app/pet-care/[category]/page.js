"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Stethoscope,
  ShieldAlert,
  ArrowUpRight,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Fish,
  Squirrel,
  PawPrint,
} from "lucide-react";

const CATEGORY_META = {
  dog: { name: "Dogs", Icon: Dog },
  cat: { name: "Cats", Icon: Cat },
  bird: { name: "Birds", Icon: Bird },
  rabbit: { name: "Rabbits", Icon: Rabbit },
  fish: { name: "Fish", Icon: Fish },
  hamster: { name: "Hamsters", Icon: Squirrel },
  other: { name: "Other Pets", Icon: PawPrint },
};

export default function PetCareCategoryPage({ params }) {
  const { category } = use(params);
  const meta = CATEGORY_META[category] || { name: "Pets", Icon: PawPrint };
  const { Icon } = meta;

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/health-suggestions?category=${encodeURIComponent(category)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load health suggestions.");
        if (!cancelled) setSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter(
      (s) =>
        s.diseaseName?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        (s.symptoms || []).some((sym) => sym.toLowerCase().includes(q))
    );
  }, [suggestions, search]);

  return (
    <main className="bg-secondary pb-20">
      {/* Header */}
      <section className="section-wrap pt-12">
        <Link
          href="/pet-care"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-[#FF9B55] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> All pet categories
        </Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <Icon className="h-8 w-8" strokeWidth={1.8} />
            </span>
            <div>
              <p className="section-kicker mb-1">Pet Health Care</p>
              <h1 className="section-heading !text-4xl">{meta.name} health guide</h1>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diseases or symptoms..."
              className="input-field !rounded-full !pl-12"
              aria-label="Search diseases or symptoms"
            />
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#ffe1b3] bg-[#fff8ec] p-4 text-sm text-[#7c4a03]">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            These suggestions are general educational information shared by pet owners. Always consult a
            qualified veterinarian before giving any medicine to your pet.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="section-wrap mt-10">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-[1.75rem] border border-[#ebe7df] bg-white" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-8 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[1.75rem] border border-[#ebe7df] bg-white p-12 text-center">
            <Stethoscope className="mx-auto mb-4 h-10 w-10 text-primary" />
            <p className="font-heading text-xl font-bold text-dark">No suggestions found</p>
            <p className="mt-2 text-sm text-light">
              {search
                ? "Try a different disease name or symptom."
                : "No health suggestions have been published for this category yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <Link
                key={s._id}
                href={`/pet-care/${category}/${s._id}`}
                className="card group flex flex-col p-6"
              >
                {s.image ? (
                  <div className="relative mb-4 h-40 overflow-hidden rounded-2xl bg-[#efe9e0]">
                    <img
                      src={s.image}
                      alt={s.diseaseName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff1e6] to-[#ffe3cd]">
                    <Icon className="h-14 w-14 text-[#df531a] transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                  </div>
                )}

                <h2 className="font-heading text-lg font-bold text-dark">{s.diseaseName}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-light">{s.description}</p>

                {Array.isArray(s.symptoms) && s.symptoms.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.symptoms.slice(0, 3).map((sym) => (
                      <span
                        key={sym}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-dark"
                      >
                        {sym}
                      </span>
                    ))}
                    {s.symptoms.length > 3 && (
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-light">
                        +{s.symptoms.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-[#b94b00]">
                  View details <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
