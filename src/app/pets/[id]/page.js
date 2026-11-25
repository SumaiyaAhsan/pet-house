"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  MapPin,
  ArrowLeft,
  MessageCircle,
  Heart,
  ShieldCheck,
  HeartPulse,
  PawPrint,
  Edit,
} from "lucide-react";

export default function PetDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [currentUser] = useState(() =>
    typeof window === "undefined" ? null : JSON.parse(localStorage.getItem("user") || "null")
  );

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
      const nextPath =
        action === "Payment"
          ? `/payment/${pet._id}`
          : action === "Chat"
            ? `/messages?pet=${pet._id}${target === "Shelter" && pet.listedBy?._id ? `&to=${pet.listedBy._id}` : ""}`
            : `/pets/${pet._id}`;
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (action === "Payment") {
      router.push(`/payment/${pet._id}`);
    } else if (action === "Chat") {
      // "Shelter" targets the pet's owner directly; "Adopter" opens the inbox
      // focused on this pet's conversations.
      if (target === "Shelter" && pet.listedBy?._id) {
        router.push(`/messages?pet=${pet._id}&to=${pet.listedBy._id}`);
      } else {
        router.push(`/messages?pet=${pet._id}`);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-light">Loading...</div>;
  if (!pet) return <div className="min-h-screen flex items-center justify-center text-light">Pet not found. <Link href="/pets" className="text-primary ml-2 underline">Go back</Link></div>;

  const images = [...new Set([pet.image, ...(Array.isArray(pet.images) ? pet.images : [])].filter(Boolean))];
  const shownImage = activeImage || images[0];
  const careDetails = [pet.healthInfo, pet.healthStatus, pet.medicalHistory]
    .filter((detail) => typeof detail === "string" && detail.trim());
  const careChecks = [
    pet.healthChecked && "Health checked",
    pet.vaccinated && "Vaccinated",
    pet.vetApproved && "Vet approved",
  ].filter(Boolean);
  const isAdopter = currentUser?.role === "user";
  const isPetOwner =
    currentUser?.role === "shelter" &&
    String(currentUser.id || currentUser._id) === String(pet.listedBy?._id);

  return (
    <main className="min-h-screen bg-secondary px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[1400px]">
        <Link
          href="/pets"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e1dccf] bg-white px-4 py-2.5 text-sm font-semibold text-light shadow-sm transition-colors hover:border-[#FF9B55] hover:bg-[#FF9B55] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to adoptable pets
        </Link>

        <p className="mb-5 text-center text-sm font-medium text-light">
          <span className="text-dark">04-01. Adoptable Pets</span>
          <span className="mx-2">•</span> Adoptable Pet Details
        </p>

        <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(230px,0.85fr)_minmax(380px,1.35fr)_minmax(260px,0.9fr)] xl:gap-6">
          <section className="order-2 rounded-[1.75rem] border border-white bg-white p-3 shadow-sm xl:order-1">
            <div className="flex h-full flex-col rounded-[1.35rem] bg-[#f7f6f4] p-5 sm:p-6">
              <p className="section-kicker mb-3">{pet.species} companion</p>
              <h1 className="font-heading text-3xl font-bold tracking-[-0.06em] text-dark sm:text-4xl">
                {pet.name}
              </h1>
              <p className="mt-2 text-sm font-medium capitalize text-light">
                {pet.species} <span className="mx-1">·</span> {pet.breed || "Mixed breed"}
              </p>

              <div className="mt-7">
                <h2 className="font-heading text-lg font-bold text-dark">About {pet.name}</h2>
                <p className="mt-2 text-sm leading-6 text-light">
                  {pet.description || `Meet ${pet.name}, a lovely ${pet.species?.toLowerCase()} looking for a caring home.`}
                </p>
              </div>

              <div className="mt-6 space-y-4 border-t border-[#e8e4de] pt-5">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-light">From</p>
                    <p className="font-semibold text-dark">{pet.location || "Location not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-light">Listed by</p>
                    <p className="font-semibold text-dark">{pet.listedBy?.name || "Verified Shelter"}</p>
                  </div>
                </div>
              </div>

              {isAdopter && (
                <div className="mt-auto pt-6">
                  <div className="rounded-2xl border border-[#f0e9df] bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-primary" />
                      <h2 className="font-heading text-sm font-bold text-dark">Health & care</h2>
                    </div>
                    {careDetails.length || careChecks.length ? (
                      <ul className="space-y-2 text-xs leading-5 text-light">
                        {careChecks.map((detail) => (
                          <li key={detail} className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> {detail}
                          </li>
                        ))}
                        {careDetails.map((detail) => <li key={detail}>{detail}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs leading-5 text-light">
                        Contact the shelter for health and vaccination records.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="order-1 flex min-w-0 flex-col gap-4 xl:order-2" aria-label={`${pet.name} photos`}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-white bg-[#ece7df] shadow-sm sm:aspect-[5/4] xl:aspect-[4/3]">
              {shownImage ? (
                <img
                  src={shownImage}
                  alt={pet.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Heart className="h-20 w-20 text-primary/40" />
                </div>
              )}
              <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-green-700 shadow-sm">
                {pet.status}
              </span>
            </div>

            {images.length > 1 && (
              <div className="flex justify-center gap-3" aria-label="Choose a pet photo">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    aria-label={`Show photo ${index + 1}`}
                    aria-pressed={shownImage === image}
                    className={`h-16 w-16 overflow-hidden rounded-xl border-2 bg-white transition sm:h-20 sm:w-20 ${
                      shownImage === image ? "border-dark shadow-sm" : "border-white hover:border-[#FF9B55] hover:bg-[#FF9B55]"
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="order-3 rounded-[1.75rem] border border-white bg-white p-3 shadow-sm">
            <div className="flex h-full flex-col rounded-[1.35rem] bg-[#f7f6f4] p-5 sm:p-6">
              <p className="text-sm font-semibold text-light">Adoption fee</p>
              <p className="mt-1 font-heading text-4xl font-bold tracking-[-0.06em] text-dark">
                {pet.price > 0 ? `৳${pet.price}` : "Free"}
              </p>
              <p className="mt-2 text-xs leading-5 text-light">
                Adoption fee details can be confirmed with the shelter.
              </p>

              <div className="mt-6 rounded-2xl bg-white p-4">
                <h2 className="mb-4 font-heading text-sm font-bold text-dark">Pet details</h2>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
                  <div>
                    <dt className="text-xs text-light">Age</dt>
                    <dd className="mt-1 font-semibold text-dark">{pet.age} {Number(pet.age) === 1 ? "year" : "years"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-light">Gender</dt>
                    <dd className="mt-1 font-semibold text-dark">{pet.gender}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-light">Breed</dt>
                    <dd className="mt-1 font-semibold text-dark">{pet.breed || "Mixed"}</dd>
                  </div>
                  {pet.weight !== undefined && pet.weight !== null && pet.weight !== "" && (
                    <div>
                      <dt className="text-xs text-light">Weight</dt>
                      <dd className="mt-1 font-semibold text-dark">{pet.weight}</dd>
                    </div>
                  )}
                </dl>
                {isAdopter && (
                  <div className="mt-4 border-t border-[#eee9e1] pt-4">
                    <p className="text-xs text-light">Health information</p>
                    <p className="mt-1 flex items-start gap-2 text-sm font-medium leading-5 text-dark">
                      <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {careDetails[0] || (careChecks.length ? careChecks.join(", ") : "Ask the shelter for health records")}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                {currentUser?.role === "admin" ? (
                  <>
                    <button
                      onClick={() => handleAction("Chat", "Shelter")}
                      className="btn-primary flex w-full items-center justify-center gap-2 py-3.5"
                    >
                      <MessageCircle className="h-5 w-5" /> Message Shelter
                    </button>
                    <button
                      onClick={() => handleAction("Chat", "Adopter")}
                      className="btn-secondary flex w-full items-center justify-center gap-2 py-3"
                    >
                      <MessageCircle className="h-5 w-5" /> Message Adopter
                    </button>
                  </>
                ) : currentUser?.role === "shelter" ? (
                  <div className={`grid gap-2 ${isPetOwner ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1"}`}>
                    <button
                      onClick={() => handleAction("Chat", "Adopter")}
                      className={`btn-secondary flex w-full items-center justify-center gap-2 py-3.5 ${isPetOwner ? "px-2 text-xs sm:text-sm" : ""}`}
                    >
                      <MessageCircle className="h-5 w-5 shrink-0" /> Message Adopter
                    </button>
                    {isPetOwner && !["reserved", "adopted"].includes(pet.status) && (
                      <Link
                        href={`/shelter/edit-pet/${pet._id}`}
                        className="btn-primary flex items-center justify-center gap-2 px-3 py-3.5 text-sm"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction("Payment")}
                      className="group flex w-full items-center justify-center gap-3 rounded-full bg-dark px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#FF9B55] hover:text-black"
                    >
                      Adopt This Pet
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-dark transition group-hover:bg-[#fff1e6]">
                        <PawPrint className="h-4 w-4" />
                      </span>
                    </button>
                    <button
                      onClick={() => handleAction("Chat", "Shelter")}
                      className="btn-secondary flex w-full items-center justify-center gap-2 py-3"
                    >
                      <MessageCircle className="h-5 w-5" /> Chat with Owner
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}