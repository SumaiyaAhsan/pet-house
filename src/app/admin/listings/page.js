"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle, Clock3, Heart, PawPrint } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

function ListingGroup({ title, description, pets, status }) {
  const isAdopted = status === "adopted";
  const isReserved = status === "reserved";
  const accent = isAdopted
    ? "bg-indigo-100 text-indigo-800"
    : isReserved
      ? "bg-orange-100 text-orange-800"
      : "bg-emerald-100 text-emerald-800";
  const StatusIcon = isAdopted ? Heart : isReserved ? Clock3 : CheckCircle;

  return (
    <section className="min-h-[420px] rounded-[2rem] border border-[#ebe7df] bg-white p-5 shadow-sm sm:p-7">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-dark">{title}</h2>
          <p className="mt-1 text-sm text-light">{description}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${accent}`}>
          <StatusIcon className="h-4 w-4" />
          {pets.length}
        </span>
      </header>

      {pets.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-secondary/70 px-6 text-center">
          <PawPrint className="mb-3 h-10 w-10 text-primary/70" />
          <p className="font-semibold text-dark">No {title.toLowerCase()} yet</p>
          <p className="mt-1 max-w-xs text-sm leading-6 text-light">
            Listings with this status will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pets.map((pet) => (
            <li
              key={pet._id}
              className="flex min-w-0 items-center gap-4 rounded-2xl border border-[#ebe7df] bg-secondary/60 p-4 sm:p-5"
            >
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-heading text-2xl font-bold ${accent}`}>
                {pet.name?.charAt(0)?.toUpperCase() || <PawPrint className="h-6 w-6" />}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-heading text-lg font-bold text-dark">{pet.name}</h3>
                <p className="mt-0.5 truncate text-sm capitalize text-light">
                  {[pet.species, pet.breed].filter(Boolean).join(" · ") || "Pet listing"}
                </p>
                <p className="mt-1 truncate text-xs text-light">
                  {pet.listedBy?.name ? `Listed by ${pet.listedBy.name}` : "Shelter listing"}
                </p>
              </div>
              <span className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize sm:inline-flex ${accent}`}>
                {status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminListingsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "admin") {
      toast.error("Access denied. Admins only.");
      router.replace("/login");
      return;
    }

    const controller = new AbortController();

    const fetchPets = async () => {
      try {
        const response = await fetch("/api/admin/pets", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Failed to load pet listings");
        if (!Array.isArray(data)) throw new Error("Pet listings are unavailable");

        setPets(data);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error(requestError);
          setError("We couldn't load the pet listings. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchPets();
    return () => controller.abort();
  }, [reload, router]);

  const approvedPets = pets.filter((pet) => pet.status === "approved");
  const reservedPets = pets.filter((pet) => pet.status === "reserved");
  const adoptedPets = pets.filter((pet) => pet.status === "adopted");

  return (
    <div className="min-h-screen bg-secondary lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <AdminSidebar active="listings" />
      <div className="min-w-0 px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-8">
            <p className="section-kicker mb-2">Marketplace</p>
            <h1 className="section-heading !text-3xl sm:!text-4xl">Pet listings</h1>
            <p className="mt-2 text-sm text-light">
              Browse approved pets and celebrate the companions who have found a home.
            </p>
          </header>

          {loading ? (
            <div className="grid gap-5 xl:grid-cols-2" aria-label="Loading pet listings">
              {[0, 1].map((item) => (
                <div key={item} className="h-[420px] animate-pulse rounded-[2rem] bg-white/70" />
              ))}
            </div>
          ) : error ? (
            <section className="rounded-3xl border border-[#ebe7df] bg-white p-8 text-center">
              <PawPrint className="mx-auto mb-3 h-9 w-9 text-primary" />
              <h2 className="font-heading text-xl font-bold text-dark">Listings unavailable</h2>
              <p className="mt-2 text-sm text-light">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setReload((value) => value + 1);
                }}
                className="btn-primary mt-5"
              >
                Try again
              </button>
            </section>
          ) : (
            <div className="grid items-start gap-5 xl:grid-cols-2">
              <ListingGroup
                title="Approved"
                description="Pets available to meet and adopt."
                pets={approvedPets}
                status="approved"
              />
              <ListingGroup
                title="Reserved"
                description="Pets with an active order awaiting completion."
                pets={reservedPets}
                status="reserved"
              />
              <ListingGroup
                title="Adopted"
                description="Pets who have found a new home."
                pets={adoptedPets}
                status="adopted"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
