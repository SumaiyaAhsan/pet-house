"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, PawPrint, Search } from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function BrowsePetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const loadMoreRequest = useRef(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ page: "1", limit: "12" });
        if (search.trim()) params.set("search", search.trim());
        if (species !== "All") params.set("species", species);

        const response = await fetch(`/api/pets/all?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load pet listings");
        if (!Array.isArray(data.pets)) throw new Error("Pet listings are unavailable");

        setPets(data.pets);
        setPage(data.page);
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error(requestError);
          setPets([]);
          setError("We couldn't load pet listings. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search.trim() ? 250 : 0);

    return () => {
      clearTimeout(timeout);
      controller.abort();
      loadMoreRequest.current?.abort();
    };
  }, [reload, search, species]);

  const loadMore = async () => {
    loadMoreRequest.current?.abort();
    const controller = new AbortController();
    loadMoreRequest.current = controller;
    setLoadingMore(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(page + 1), limit: "12" });
      if (search.trim()) params.set("search", search.trim());
      if (species !== "All") params.set("species", species);

      const response = await fetch(`/api/pets/all?${params}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load more pets");
      if (!Array.isArray(data.pets)) throw new Error("Pet listings are unavailable");

      setPets((currentPets) => [...currentPets, ...data.pets]);
      setPage(data.page);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        console.error(requestError);
        setError("We couldn't load more pets. Please try again.");
      }
    } finally {
      if (loadMoreRequest.current === controller) {
        loadMoreRequest.current = null;
        setLoadingMore(false);
      }
    }
  };

  const handleViewDetails = (petId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthModalOpen(true); // Show popup
    } else {
      router.push(`/pets/${petId}`); // Go to details
    }
  };

  return (
    <div className="min-h-screen bg-secondary px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-7xl mx-auto">

        <div className="mb-9 flex flex-col gap-6 border-b border-[#e7e1d7] pb-8 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:pb-10">
          <div className="max-w-2xl">
            <p className="section-kicker mb-3">Adoptable pets</p>
            <h1 className="section-heading">
              Find a friend who feels like <span className="text-primary">family.</span>
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-light">
              Meet the pets looking for a safe, loving place to call home.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e7e1d7] bg-white px-5 py-3 text-sm text-light">
            {loading ? (
              "Loading listings..."
            ) : (
              <>
                <span className="font-bold text-dark">{total}</span> pets listed
              </>
            )}
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or species..."
              className="input-field !pl-12 bg-white shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search pets by name or species"
            />
          </div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {["All", "Dog", "Cat", "Bird", "Rabbit"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSpecies(item)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  species === item
                    ? "bg-dark text-white"
                    : "border border-[#e1dccf] bg-white text-light hover:border-primary hover:text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[390px] animate-pulse rounded-[1.75rem] bg-white/70" />
            ))}
          </div>
        ) : error && pets.length === 0 ? (
          <div className="rounded-[1.75rem] border border-[#ebe7df] bg-white px-6 py-16 text-center">
            <PawPrint className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="font-heading text-2xl font-bold text-dark">Listings couldn&apos;t load</h2>
            <p className="mt-2 text-sm text-light">{error}</p>
            <button type="button" onClick={() => setReload((value) => value + 1)} className="btn-primary mt-5">
              Try again
            </button>
          </div>
        ) : pets.length === 0 ? (
          <div className="rounded-[1.75rem] border border-[#ebe7df] bg-white px-6 py-16 text-center">
            <PawPrint className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="font-heading text-2xl font-bold text-dark">
              {search || species !== "All" ? "No pets match these filters" : "No pets listed just yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-light">
              {search || species !== "All" ? "Try another search or category to find your new best friend." : "Check back soon for new companions looking for a home."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {pets.map((pet) => (
              <div key={pet._id} className="card bg-white flex flex-col group">
                
                <div className="relative h-56 overflow-hidden bg-[#efe9df]">
                  {pet.image ? (
                    <img src={pet.image} alt={pet.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <PawPrint className="h-10 w-10 text-primary/50" />
                    </div>
                  )}
                  
                  <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                    pet.status === "approved" ? "bg-green-100 text-green-700" :
                    pet.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {pet.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-grow flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-heading text-xl font-bold text-dark">{pet.name}</h3>
                    <span className="whitespace-nowrap text-sm font-bold text-primary">
                      {pet.price > 0 ? `৳${pet.price}` : "Free"}
                    </span>
                  </div>
                  
                  <p className="text-sm text-light mb-2 capitalize">
                    {pet.species} • {pet.breed || "Mixed"} • {pet.age} yrs • {pet.gender}
                  </p>
                  
                  <div className="flex items-center text-sm text-light mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-primary" /> {pet.location}
                  </div>
                  
                  <button 
                    onClick={() => handleViewDetails(pet._id)} 
                    className="btn-primary mt-auto w-full py-2.5 text-sm"
                  >
                    Meet {pet.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
            {error && <p className="mt-5 text-center text-sm text-red-600">{error}</p>}
            {hasMore && (
              <div className="mt-10 text-center">
                <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-secondary min-w-44">
                  {loadingMore ? "Loading more..." : "Load more pets"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}