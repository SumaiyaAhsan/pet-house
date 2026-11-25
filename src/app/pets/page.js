import Link from "next/link";
import { ArrowUpRight, MapPin, PawPrint, Search } from "lucide-react";
import connectDB from "@/lib/db";
import Pet from "@/lib/models/Pet";
import "@/lib/models/User";
import { getPublicPetFilter } from "@/lib/public-pets";
import ChatWithOwnerButton from "@/components/ChatWithOwnerButton";

export default async function AdoptablePetsPage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = 12;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const species = typeof params.species === "string" ? params.species : "All";
  const filter = {};

  if (species && species !== "All") {
    filter.species = new RegExp(`^${species.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { species: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  let pets = [];
  let total = 0;
  let error = "";

  try {
    await connectDB();
    const publicPetFilter = await getPublicPetFilter(filter);
    [pets, total] = await Promise.all([
      Pet.find(publicPetFilter)
        .select("name species breed age gender location price status listedBy createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("listedBy", "name")
        .lean(),
      Pet.countDocuments(publicPetFilter),
    ]);
  } catch (fetchError) {
    console.error("Pet listings error:", fetchError);
    error = "We couldn't load pet listings right now.";
  }

  const petsWithImages = pets.map((pet) => ({
    ...pet,
    image: `/api/pets/${pet._id}/image?v=${pet.updatedAt?.getTime() ?? 0}`,
  }));
  const hasMore = page * limit < total;

  const filterParams = (nextPage) => {
    const next = new URLSearchParams();
    if (search) next.set("search", search);
    if (species !== "All") next.set("species", species);
    if (nextPage > 1) next.set("page", String(nextPage));
    const query = next.toString();
    return query ? `/pets?${query}` : "/pets";
  };

  return (
    <main className="min-h-screen bg-secondary py-12 sm:py-16">
      <div className="section-wrap">
        <div className="mb-8 max-w-2xl">
          <p className="section-kicker mb-3">Adoptable pets</p>
          <h1 className="section-heading">Find a companion who feels like family</h1>
        </div>

        <form method="get" className="mb-8 flex flex-col gap-3 rounded-[1.5rem] border border-[#ebe7df] bg-white p-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search pets</span>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-light" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name or species"
              className="input-field pl-12"
            />
          </label>
          <select
            name="species"
            defaultValue={species}
            className="input-field sm:w-48"
            aria-label="Filter by species"
          >
            {["All", "Dog", "Cat", "Rabbit", "Bird", "Hamster", "Other"].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </form>

        {error ? (
          <div className="rounded-3xl border border-[#ebe7df] bg-white p-8 text-center text-light">
            {error}
          </div>
        ) : petsWithImages.length === 0 ? (
          <div className="rounded-3xl border border-[#ebe7df] bg-white px-6 py-12 text-center">
            <PawPrint className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="font-heading text-xl font-bold text-dark">No matching pets found</h2>
            <p className="mt-2 text-sm text-light">Try another search or species filter.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {petsWithImages.map((pet) => (
                <div key={pet._id} className="relative h-full">
                  <Link
                    href={`/pets/${pet._id}`}
                    className="card pet-listing-card group flex h-full flex-col"
                    aria-label={`View ${pet.name}`}
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
                        <h2 className="font-heading text-2xl font-bold text-dark">{pet.name}</h2>
                        <p className="mt-1 text-sm capitalize text-light">
                          {pet.breed || "Mixed breed"} · {pet.age} {Number(pet.age) === 1 ? "year" : "years"}
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-dark">
                        {pet.price > 0 ? `৳${pet.price}` : "Free"}
                      </span>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-sm text-light">
                      <MapPin className="h-4 w-4 text-primary" /> {pet.location}
                    </p>
                    <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-bold text-primary">
                      Meet {pet.name} <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  </Link>
                  <ChatWithOwnerButton
                    petId={String(pet._id)}
                    ownerId={String(pet.listedBy?._id || "")}
                    ownerName={pet.listedBy?.name || "Owner"}
                    className="absolute right-4 top-4 z-10"
                  />
                </div>
              ))}
            </div>

            {page > 1 || hasMore ? (
              <div className="mt-8 flex justify-center gap-3">
                {page > 1 && (
                  <Link href={filterParams(page - 1)} className="btn-secondary">Previous</Link>
                )}
                {hasMore && (
                  <Link href={filterParams(page + 1)} className="btn-primary">Load more</Link>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
