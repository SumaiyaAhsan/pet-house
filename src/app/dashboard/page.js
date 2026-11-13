"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, PawPrint, PlusCircle, Edit, Clock } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch user profile first
    fetch("/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => {
        setUser(userData);
        
        // Now fetch data based on role
        if (userData.role === "shelter") {
          return fetch("/api/shelter/pets", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((petsData) => {
              if (Array.isArray(petsData)) setPets(petsData);
            });
        } else if (userData.role === "user") {
          return fetch("/api/user/adoptions", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((adoptionsData) => {
              if (Array.isArray(adoptionsData)) setAdoptions(adoptionsData);
            });
        }
      })
      .catch((err) => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-light">Loading Dashboard...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-dark">Welcome, {user.name}</h1>
            <p className="text-light capitalize">{user.role} Account</p>
          </div>
          {user.role === "shelter" && (
            <Link href="/shelter/add-pet" className="btn-primary flex items-center gap-2">
              <PlusCircle className="w-5 h-5" /> Add New Pet
            </Link>
          )}
        </div>

        {/* Wallet Card - ONLY FOR USERS (Adopters) */}
        {user.role === "user" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 flex items-center gap-4 border-l-4 border-primary">
            <div className="bg-secondary p-3 rounded-full">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-light">Current Wallet Balance</p>
              <p className="text-3xl font-bold text-dark">৳ {user.walletBalance}</p>
            </div>
          </div>
        )}

        {/* SHELTER VIEW: My Pets */}
        {user.role === "shelter" && (
          <div>
            <h2 className="text-2xl font-heading font-bold text-dark mb-4">My Pet Listings</h2>
            {pets.length === 0 ? (
              <p className="text-light">You haven't listed any pets yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <div key={pet._id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center">
                    <img src={pet.image} alt={pet.name} className="w-20 h-20 object-cover rounded-xl" />
                    <div className="flex-grow">
                      <h3 className="font-bold text-dark text-lg">{pet.name}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        pet.status === "approved" ? "bg-green-100 text-green-700" :
                        pet.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {pet.status.toUpperCase()}
                      </span>
                      <div className="mt-2">
                        <Link href={`/shelter/edit-pet/${pet._id}`} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                          <Edit className="w-4 h-4" /> Edit Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USER VIEW: My Adoptions */}
        {user.role === "user" && (
          <div className="mt-4">
            <h2 className="text-2xl font-heading font-bold text-dark mb-4">My Adoptions</h2>
            {adoptions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <PawPrint className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Ready to Adopt?</h2>
                <p className="text-light mb-4">You haven't adopted any pets yet. Browse our lovely pets and find your new best friend.</p>
                <Link href="/pets" className="btn-primary">Browse Pets</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adoptions.map((tx) => (
                  <div key={tx._id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center border-l-4 border-green-500">
                    {tx.pet?.image ? (
                      <img src={tx.pet.image} alt={tx.pet.name} className="w-20 h-20 object-cover rounded-xl" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">No Img</div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-bold text-dark text-lg">{tx.pet?.name || "Deleted Pet"}</h3>
                      <p className="text-xs text-light capitalize mb-1">{tx.pet?.species} • {tx.pet?.breed}</p>
                      <p className="text-sm font-bold text-green-600">Paid: ৳{tx.amount}</p>
                      <p className="text-xs text-light flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}