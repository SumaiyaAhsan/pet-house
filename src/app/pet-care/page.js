import Link from "next/link";
import { Dog, Cat, Bird, Rabbit, Fish, Squirrel, PawPrint, HeartPulse, ShieldAlert, Settings2 } from "lucide-react";

const categories = [
  { slug: "dog", name: "Dogs", Icon: Dog, tint: "bg-[#ffe8d6] text-[#b94b00]" },
  { slug: "cat", name: "Cats", Icon: Cat, tint: "bg-[#e8f0ff] text-[#1d4ed8]" },
  { slug: "bird", name: "Birds", Icon: Bird, tint: "bg-[#e2f8e8] text-[#15803d]" },
  { slug: "rabbit", name: "Rabbits", Icon: Rabbit, tint: "bg-[#fde8f1] text-[#be185d]" },
  { slug: "fish", name: "Fish", Icon: Fish, tint: "bg-[#e0f7fa] text-[#0e7490]" },
  { slug: "hamster", name: "Hamsters", Icon: Squirrel, tint: "bg-[#fff4d6] text-[#b45309]" },
  { slug: "other", name: "Other Pets", Icon: PawPrint, tint: "bg-[#efe9ff] text-[#6d28d9]" },
];

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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map(({ slug, name, Icon, tint }) => (
              <Link
                key={slug}
                href={`/pet-care/${slug}`}
                className="group flex flex-col items-center gap-3 rounded-[1.75rem] border border-[#ebe7df] bg-white px-4 py-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-hover-border hover:bg-hover-tint hover:shadow-xl"
              >
                <span
                  className={`flex h-20 w-20 items-center justify-center rounded-full shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${tint}`}
                >
                  <Icon className="h-9 w-9" strokeWidth={1.8} />
                </span>
                <span className="text-sm font-semibold text-dark transition-colors group-hover:text-[#b94b00]">
                  {name}
                </span>
              </Link>
            ))}

            {/* Manage tile (owners) */}
            <Link
              href="/pet-care/manage"
              className="group flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed border-[#d6d3cd] bg-white/60 px-4 py-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-hover-tint"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#111214] text-white shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Settings2 className="h-9 w-9" strokeWidth={1.8} />
              </span>
              <span className="text-sm font-semibold text-dark transition-colors group-hover:text-[#b94b00]">
                Manage Suggestions
              </span>
            </Link>
          </div>

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
