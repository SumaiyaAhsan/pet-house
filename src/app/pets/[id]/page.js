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
  const [currentUser] = useState(() =>
    typeof window === "undefined" ? null : JSON.parse(localStorage.getItem("user") || "null")
  );
  const [chatTarget, setChatTarget] = useState("Shelter"); // Default to Shelter

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/pets/${id}?optimized=1`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load pet details");
        if (data.status !== "approved") throw new Error("Pet not found in list");
        setPet(data);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load pet details");
      })
      .finally(() => setLoading(false));
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
    <main className="min-h-screen bg-secondary py-10 px-4 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/pets" className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e1dccf] bg-white px-4 py-2 text-sm font-semibold text-light transition-colors hover:border-primary hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to adoptable pets
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-[#ebe7df] bg-white shadow-sm lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          
          <div className="relative min-h-[360px] bg-[#efe9df] lg:min-h-[620px]">
            {pet.image ? (
              <img src={pet.image} alt={pet.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center text-gray-400 lg:min-h-[620px]">
                <Heart className="h-16 w-16 text-primary/40" />
              </div>
            )}
            <span className={`absolute top-4 right-4 px-3 py-1 text-sm font-bold rounded-lg shadow-md ${
              pet.status === "approved" ? "bg-green-100 text-green-700" :
              pet.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {pet.status.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            <p className="section-kicker mb-3">{pet.species} companion</p>
            <div className="flex justify-between items-start mb-3 gap-4">
              <h1 className="section-heading !text-4xl sm:!text-5xl">{pet.name}</h1>
              <span className="shrink-0 rounded-full bg-secondary px-4 py-2 text-lg font-bold text-dark">
                {pet.price > 0 ? `৳${pet.price}` : "Free"}
              </span>
            </div>

            <p className="mb-6 text-sm font-medium text-light capitalize">
              {pet.species} • {pet.breed || "Mixed"} • {pet.age} Years • {pet.gender}
            </p>

            <div className="mb-6 flex items-center gap-2 border-y border-[#eee9e1] py-4 text-sm text-light">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-semibold text-dark">Location:</span> {pet.location}
            </div>

            <div className="mb-8">
              <h3 className="font-heading font-bold text-lg mb-2">About {pet.name}</h3>
              <p className="text-light leading-relaxed">{pet.description}</p>
            </div>

            <div className="mb-8 flex items-center gap-3 rounded-2xl bg-secondary p-4">
              <ShieldCheck className="h-8 w-8 shrink-0 text-primary" />
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
    </main>
  );
}