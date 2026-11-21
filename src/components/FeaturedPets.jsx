"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MapPin, PawPrint } from "lucide-react";

export default function FeaturedPets() {
  const pathname = usePathname();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pathname !== "/") return;

    let cancelled = false;

    fetch("/api/pets/all?limit=3", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load pets");
        if (!Array.isArray(data.pets)) throw new Error("Pet listings are unavailable");
        if (!cancelled) setPets(data.pets);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't load pet listings right now. Please try again later.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <section className="section-wrap py-20 sm:py-28" aria-labelledby="featured-pets-heading">
      <div className="mb-9 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker mb-3">Meet your new best friend</p>
          <h2 id="featured-pets-heading" className="section-heading max-w-2xl">
            A few lovely faces looking for a home
          </h2>
        </div>
        <Link href="/pets" className="btn-secondary w-fit">
          View all pets <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-[390px] animate-pulse rounded-[1.75rem] bg-white/70" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[#ebe7df] bg-white p-8 text-center text-light">
          {error}
        </div>
      ) : pets.length === 0 ? (
        <div className="rounded-3xl border border-[#ebe7df] bg-white px-6 py-12 text-center">
          <PawPrint className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h3 className="font-heading text-xl font-bold text-dark">New friends are on their way</h3>
          <p className="mt-2 text-sm text-light">There are no approved listings yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Link
              key={pet._id}
              href={`/pets/${pet._id}`}
              className="card group flex flex-col"
              aria-label={`Browse ${pet.name} and other pets`}
            >
              <div className="relative h-64 overflow-hidden bg-[#efe9df]">
                {pet.image ? (
                  <img
                    src={pet.image}
                    alt={pet.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PawPrint className="h-14 w-14 text-primary/50" />
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-dark shadow-sm">
                  {pet.species}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-dark">{pet.name}</h3>
                    <p className="mt-1 text-sm capitalize text-light">
                      {pet.breed || "Mixed breed"} · {pet.age} {Number(pet.age) === 1 ? "year" : "years"}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-dark">
                    {pet.price > 0 ? `৳${pet.price}` : "Free"}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#eee9e1] pt-4 text-sm text-light">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> {pet.location || "Location not listed"}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-dark transition-colors group-hover:bg-primary">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
