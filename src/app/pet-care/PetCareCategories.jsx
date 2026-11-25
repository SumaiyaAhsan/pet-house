"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Dog, Cat, Bird, Rabbit, Squirrel, PawPrint, Settings2 } from "lucide-react";

const categories = [
  { slug: "dog", name: "Dogs", Icon: Dog, tint: "bg-[#ffe8d6] text-[#b94b00]" },
  { slug: "cat", name: "Cats", Icon: Cat, tint: "bg-[#e8f0ff] text-[#1d4ed8]" },
  { slug: "bird", name: "Birds", Icon: Bird, tint: "bg-[#e2f8e8] text-[#15803d]" },
  { slug: "rabbit", name: "Rabbits", Icon: Rabbit, tint: "bg-[#fde8f1] text-[#be185d]" },
  { slug: "hamster", name: "Hamsters", Icon: Squirrel, tint: "bg-[#fff4d6] text-[#b45309]" },
  { slug: "other", name: "Other Pets", Icon: PawPrint, tint: "bg-[#efe9ff] text-[#6d28d9]" },
];

function subscribeToUser(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("pet-house:user-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("pet-house:user-updated", callback);
  };
}

function getStoredUserRole() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.role ?? null;
  } catch {
    return null;
  }
}

function getServerUserRole() {
  return null;
}

export default function PetCareCategories() {
  const role = useSyncExternalStore(subscribeToUser, getStoredUserRole, getServerUserRole);

  return (
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

      {role === "shelter" && (
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
      )}
    </div>
  );
}
