import { HeartPulse, ShieldAlert } from "lucide-react";
import PetCareCategories from "./PetCareCategories";

export const metadata = {
  title: "Pet Care & Health Suggestions | Pet House",
  description:
    "Browse pet health care suggestions, common diseases, symptoms, and medicine guidance shared by pet owners on Pet House.",
};

export default function PetCarePage() {
  return (
    <main className="grid min-h-[calc(100vh-88px)] bg-secondary lg:grid-cols-[1fr_0.95fr]">
      {/* Left: hero image, same layout as the Login/Registration page */}
      <section className="relative hidden overflow-hidden bg-[#111214] lg:block">
        <img
          src="/pet-care-vet.png"
          alt="A veterinarian gently checking a pet bird"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-[#111214]/20 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <HeartPulse className="mb-5 h-10 w-10 text-primary" />
          <p className="max-w-lg font-heading text-4xl font-bold leading-tight">
            Caring for your pet&apos;s health, every single day.
          </p>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Health tips, common diseases, symptoms, and care suggestions shared by experienced pet owners.
          </p>
        </div>
      </section>

      {/* Right: circular pet categories */}
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center sm:text-left">
            <p className="section-kicker mb-3">Pet Health Care</p>
            <h1 className="section-heading !text-4xl">Choose your pet</h1>
            <p className="mt-3 text-sm text-light">
              Select a pet category to explore common diseases, symptoms, and owner-shared care suggestions.
            </p>
          </div>

          <PetCareCategories />

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#ffe1b3] bg-[#fff8ec] p-4 text-sm text-[#7c4a03]">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              The information here is general educational guidance shared by pet owners, not a prescription.
              Always consult a qualified veterinarian before giving any medicine to your pet.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
