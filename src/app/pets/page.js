"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Search, Heart } from "lucide-react";

export default function BrowsePetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/pets/all")
      .then((res) => res.json())
      .then((data) => {
        setPets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter pets based on search
  const filteredPets = pets.filter((pet) =>
    pet.name.toLowerCase().includes(search.toLowerCase()) ||
    pet.species.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-dark mb-4">
            Find Your New <span className="text-primary">Best Friend</span>
          </h1>
          <p className="text-light max-w-2xl mx-auto">
            Browse our lovely pets waiting for a forever home.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or species..."
            className="input-field !pl-12 bg-white shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Pet Grid */}
        {loading ? (
          <div className="text-center text-light py-20 text-lg">Loading pets...</div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center text-light py-20 text-lg">
            No pets found. Try a different search!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPets.map((pet) => (
              <div key={pet._id} className="card bg-white flex flex-col group">
                
                {/* Image */}
                <div className="h-56 bg-gray-100 overflow-hidden relative">
                  {pet.image ? (
                    <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                  
                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-md shadow-sm ${
                    pet.status === "approved" ? "bg-green-100 text-green-700" :
                    pet.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {pet.status.toUpperCase()}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-heading font-bold text-dark">{pet.name}</h3>
                    <span className="text-primary font-bold text-lg">
                      {pet.price > 0 ? `৳${pet.price}` : "Free"}
                    </span>
                  </div>
                  
                  <p className="text-sm text-light mb-2 capitalize">
                    {pet.species} • {pet.breed || "Mixed"} • {pet.age} yrs • {pet.gender}
                  </p>
                  
                  <div className="flex items-center text-sm text-light mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-primary" /> {pet.location}
                  </div>
                  
                  {/* Button */}
                  <Link href={`/pets/${pet._id}`} className="btn-primary text-center w-full mt-auto py-2.5 text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}