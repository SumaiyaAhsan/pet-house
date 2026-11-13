"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { MapPin, ArrowLeft, MessageCircle, Heart, ShieldCheck } from "lucide-react";
import ChatModal from "@/components/ChatModal";

export default function PetDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatTarget, setChatTarget] = useState("Shelter"); // Default to Shelter

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));

    if (!id) return;
    
    fetch("/api/pets/all")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const foundPet = data.find((p) => p._id === id);
          if (foundPet) setPet(foundPet);
          else toast.error("Pet not found in list");
        } else {
          toast.error("Failed to load data");
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Failed to load pet details");
        setLoading(false);
      });
  }, [id]);

  const handleAction = async (action, target = "Shelter") => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    if (action === "Payment") {
      const confirmPay = window.confirm(`Are you sure you want to pay ৳${pet.price} to adopt ${pet.name}?`);
      if (!confirmPay) return;

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ petId: pet._id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success(data.message);
        router.push("/"); 
      } catch (error) {
        toast.error(error.message);
      }
    } else if (action === "Chat") {
      setChatTarget(target);
      setIsChatOpen(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-light">Loading...</div>;
  if (!pet) return <div className="min-h-screen flex items-center justify-center text-light">Pet not found. <Link href="/pets" className="text-primary ml-2 underline">Go back</Link></div>;

  return (
    <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/pets" className="flex items-center gap-2 text-light hover:text-primary mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          
          <div className="md:w-1/2 h-80 md:h-auto bg-gray-100 relative">
            {pet.image ? (
              <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
            <span className={`absolute top-4 right-4 px-3 py-1 text-sm font-bold rounded-lg shadow-md ${
              pet.status === "approved" ? "bg-green-100 text-green-700" :
              pet.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {pet.status.toUpperCase()}
            </span>
          </div>

          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-dark">{pet.name}</h1>
              <span className="text-2xl font-bold text-primary">
                {pet.price > 0 ? `৳${pet.price}` : "Free"}
              </span>
            </div>

            <p className="text-light font-medium mb-6 capitalize">
              {pet.species} • {pet.breed || "Mixed"} • {pet.age} Years • {pet.gender}
            </p>

            <div className="flex items-center text-light mb-6 pb-6 border-b border-gray-100">
              <MapPin className="w-5 h-5 mr-2 text-primary" /> 
              <span className="font-medium text-dark">Location:</span> {pet.location}
            </div>

            <div className="mb-8">
              <h3 className="font-heading font-bold text-lg mb-2">About {pet.name}</h3>
              <p className="text-light leading-relaxed">{pet.description}</p>
            </div>

            <div className="bg-secondary rounded-xl p-4 mb-8 flex items-center gap-3">
              <ShieldCheck className="text-primary w-8 h-8" />
              <div>
                <p className="text-sm text-light">Listed by</p>
                <p className="font-bold text-dark">{pet.listedBy?.name || "Verified Shelter"}</p>
              </div>
            </div>

            {/* Dynamic Action Buttons */}
            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              
              {/* 1. ADMIN: Both Buttons */}
              {currentUser?.role === "admin" ? (
                <>
                  <button onClick={() => handleAction("Chat", "Shelter")} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                    <MessageCircle className="w-5 h-5" /> Message Shelter
                  </button>
                  <button onClick={() => handleAction("Chat", "Adopter")} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3">
                    <MessageCircle className="w-5 h-5" /> Message Adopter
                  </button>
                </>
              ) : 
              
              /* 2. SHELTER: Message Adopter only */
              currentUser?.role === "shelter" ? (
                <button onClick={() => handleAction("Chat", "Adopter")} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3">
                  <MessageCircle className="w-5 h-5" /> Message Adopter
                </button>
              ) : 
              
              /* 3. USER (Adopter): Message Shelter + Adopt Now */
              (
                <>
                  <button onClick={() => handleAction("Chat", "Shelter")} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3">
                    <MessageCircle className="w-5 h-5" /> Message Shelter
                  </button>
                  <button onClick={() => handleAction("Payment")} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                    <Heart className="w-5 h-5" /> Adopt Now
                  </button>
                </>
              )}
              
            </div>
          </div>
        </div>
      </div>
      
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        petId={pet._id} 
        shelterId={pet.listedBy?._id} 
        shelterName={chatTarget === "Adopter" ? "Adopter" : (pet.listedBy?.name || "Shelter")} 
        currentUser={currentUser}  
      />
    </div>
  );
}