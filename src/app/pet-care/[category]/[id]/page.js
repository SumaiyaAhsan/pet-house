"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  AlertTriangle,
  ShieldAlert,
  Stethoscope,
  Pill,
  ExternalLink,
  PhoneCall,
  ClipboardList,
  Activity,
  HeartHandshake,
  User,
} from "lucide-react";

const CATEGORY_NAMES = {
  dog: "Dogs",
  cat: "Cats",
  bird: "Birds",
  rabbit: "Rabbits",
  fish: "Fish",
  hamster: "Hamsters",
  other: "Other Pets",
};

function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export default function PetCareDetailPage({ params }) {
  const { category, id } = use(params);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/health-suggestions/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load this suggestion.");
        if (!cancelled) setSuggestion(data);
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
  }, [id]);

  const categoryName = CATEGORY_NAMES[category] || "Pets";

  if (loading) {
    return (
      <main className="bg-secondary pb-20">
        <div className="section-wrap pt-12">
          <div className="h-8 w-40 animate-pulse rounded-full bg-white" />
          <div className="mt-8 h-64 animate-pulse rounded-[1.75rem] border border-[#ebe7df] bg-white" />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-[1.75rem] border border-[#ebe7df] bg-white" />
            <div className="h-72 animate-pulse rounded-[1.75rem] border border-[#ebe7df] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !suggestion) {
    return (
      <main className="bg-secondary pb-20">
        <div className="section-wrap pt-12">
          <Link
            href={`/pet-care/${category}`}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-[#FF9B55] hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {categoryName}
          </Link>
          <div className="mt-8 rounded-[1.75rem] border border-red-200 bg-red-50 p-10 text-center text-sm font-medium text-red-700">
            {error || "Suggestion not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-secondary pb-20">
      <div className="section-wrap pt-12">
        <Link
          href={`/pet-care/${category}`}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-[#FF9B55] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {categoryName}
        </Link>

        {/* Header */}
        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#ebe7df] bg-white shadow-sm">
          {suggestion.image && (
            <div className="relative h-64 w-full bg-[#efe9e0] sm:h-80">
              <img src={suggestion.image} alt={suggestion.diseaseName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111214]/60 to-transparent" />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <p className="section-kicker mb-2">{categoryName} health guide</p>
            <h1 className="section-heading !text-3xl sm:!text-4xl">{suggestion.diseaseName}</h1>
            {suggestion.owner?.name && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-light">
                <User className="h-4 w-4" /> Shared by {suggestion.owner.name}
              </p>
            )}
          </div>
        </div>

        {/* Emergency warning */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <PhoneCall className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <span className="font-bold">Emergency signs:</span> trouble breathing, bleeding, seizures,
            collapse, or refusal to eat or drink for more than a day need immediate veterinary care. Do not
            wait for online advice.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* A. Disease information */}
          <section className="rounded-[1.75rem] border border-[#ebe7df] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Stethoscope className="h-5 w-5" />
              </span>
              <h2 className="font-heading text-xl font-bold text-dark">Disease information</h2>
            </div>

            {suggestion.description && (
              <div className="mb-6">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#df531a]">
                  <ClipboardList className="h-4 w-4" /> About this condition
                </h3>
                <p className="text-sm leading-relaxed text-light">{suggestion.description}</p>
              </div>
            )}

            {Array.isArray(suggestion.symptoms) && suggestion.symptoms.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#df531a]">
                  <Activity className="h-4 w-4" /> Common symptoms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestion.symptoms.map((sym) => (
                    <span key={sym} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-dark">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {suggestion.causes && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#df531a]">Possible causes</h3>
                <p className="text-sm leading-relaxed text-light">{suggestion.causes}</p>
              </div>
            )}

            {suggestion.effects && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#df531a]">
                  How it affects your pet
                </h3>
                <p className="text-sm leading-relaxed text-light">{suggestion.effects}</p>
              </div>
            )}

            {suggestion.carePrevention && (
              <div className="rounded-2xl bg-[#e2f8e8] p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#15803d]">
                  <HeartHandshake className="h-4 w-4" /> Care &amp; prevention
                </h3>
                <p className="text-sm leading-relaxed text-[#14532d]">{suggestion.carePrevention}</p>
              </div>
            )}

            <a
              href={googleSearchUrl(`${suggestion.diseaseName} in ${categoryName.toLowerCase()} symptoms treatment`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-6 w-full"
            >
              Search this disease on Google <ExternalLink className="h-4 w-4" />
            </a>
          </section>

          {/* B. Medicine suggestions */}
          <section className="rounded-[1.75rem] border border-[#ebe7df] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Pill className="h-5 w-5" />
              </span>
              <h2 className="font-heading text-xl font-bold text-dark">Medicine suggestions</h2>
            </div>

            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#ffe1b3] bg-[#fff8ec] p-4 text-sm text-[#7c4a03]">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                These are general educational suggestions, not prescriptions. The right medicine and dosage
                depend on your pet&apos;s condition, age, and weight. Consult a qualified veterinarian first.
              </p>
            </div>

            {Array.isArray(suggestion.medicines) && suggestion.medicines.length > 0 ? (
              <div className="space-y-4">
                {suggestion.medicines.map((med, index) => (
                  <div
                    key={`${med.name}-${index}`}
                    className="rounded-2xl border border-[#ebe7df] p-4 transition-colors hover:border-hover-border hover:bg-hover-tint"
                  >
                    <div className="flex items-start gap-4">
                      {med.image ? (
                        <img
                          src={med.image}
                          alt={med.name}
                          className="h-16 w-16 shrink-0 rounded-xl border border-[#ebe7df] object-cover"
                        />
                      ) : (
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                          <Pill className="h-7 w-7" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-heading text-base font-bold text-dark">{med.name}</h3>
                        {med.description && (
                          <p className="mt-1 text-sm leading-relaxed text-light">{med.description}</p>
                        )}
                      </div>
                    </div>
                    <a
                      href={googleSearchUrl(`${med.name} for ${categoryName.toLowerCase()} vet guidance`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-[#b94b00]"
                    >
                      Search this medicine on Google <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-secondary p-4 text-sm text-light">
                No medicine suggestions have been added for this condition yet.
              </p>
            )}

            {/* C. Reference links */}
            {Array.isArray(suggestion.referenceLinks) && suggestion.referenceLinks.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#df531a]">
                  Useful reference links
                </h3>
                <div className="space-y-2">
                  {suggestion.referenceLinks.map((link, index) => (
                    <a
                      key={`${link.url}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#ebe7df] px-4 py-3 text-sm font-semibold text-dark transition-colors hover:border-hover-border hover:bg-hover-tint"
                    >
                      <span className="truncate">{link.label}</span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-secondary p-4 text-sm text-light">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#df531a]" />
              <p>
                Never give human medicine to a pet unless a veterinarian specifically tells you to. Many common
                human medicines are toxic to animals.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
