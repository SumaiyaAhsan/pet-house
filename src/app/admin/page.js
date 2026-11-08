"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  useEffect(() => {
    if (!token || user.role !== "admin") {
      toast.error("Access Denied. Admins only.");
      router.push("/login");
      return;
    }
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await fetch("/api/admin/pets");
      const data = await res.json();
      if (Array.isArray(data)) setPets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (petId, status) => {
    try {
      const res = await fetch("/api/admin/pets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ petId, status }),
      });

      if (!res.ok) throw new Error("Action failed");
      
      toast.success(`Pet ${status} successfully!`);
      fetchPets(); 
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-dark">Admin Dashboard</h1>
        </div>

        <div className="card bg-white p-6">
          <h2 className="text-xl font-bold mb-4">Pet Listing Approvals</h2>
          
          {pets.length === 0 ? (
            <p className="text-light">No pets found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-2 text-sm text-light font-semibold">Pet Name</th>
                    <th className="py-3 px-2 text-sm text-light font-semibold">Shelter</th>
                    <th className="py-3 px-2 text-sm text-light font-semibold">Status</th>
                    <th className="py-3 px-2 text-sm text-light font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pets.map((pet) => (
                    <tr key={pet._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-2 font-bold text-dark">{pet.name}</td>
                      <td className="py-4 px-2 text-sm text-light">{pet.listedBy?.name || "Unknown"}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                          pet.status === "approved" ? "bg-green-100 text-green-700" :
                          pet.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {pet.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-2 flex gap-2">
                        {pet.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(pet._id, "approved")} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition" title="Approve">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleAction(pet._id, "adopted")} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition" title="Reject">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}