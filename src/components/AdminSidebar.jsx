"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LayoutDashboard, ListChecks, LogOut, PawPrint } from "lucide-react";

export default function AdminSidebar({ active }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("pet-house:user-updated"));
    toast.success("Logged out successfully");
    router.replace("/");
  };

  const dashboardClass =
    active === "dashboard"
      ? "bg-white text-dark"
      : "text-white/70 transition-colors hover:bg-[#FF9B55] hover:text-black";
  const listingsClass =
    active === "listings"
      ? "bg-white text-dark"
      : "text-white/70 transition-colors hover:bg-[#FF9B55] hover:text-black";

  return (
    <aside className="flex flex-col justify-between bg-dark px-4 py-4 text-white sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:px-4 lg:py-7">
      <div>
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Pet House home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-dark">
            <PawPrint className="h-5 w-5" />
          </span>
          <span className="font-heading text-xl font-extrabold tracking-tight">
            Pet<span className="text-primary">House</span>
          </span>
        </Link>

        <nav aria-label="Admin dashboard" className="mt-5 flex gap-2 overflow-x-auto lg:mt-12 lg:flex-col">
          <Link
            href="/admin"
            aria-current={active === "dashboard" ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${dashboardClass}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/listings"
            aria-current={active === "listings" ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${listingsClass}`}
          >
            <ListChecks className="h-4 w-4" />
            Pet listings
          </Link>
        </nav>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 lg:mt-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-dark">
            A
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">Administrator</span>
            <span className="block text-xs text-white/55">Pet House admin</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full p-2 text-white/65 transition-colors hover:bg-[#FF9B55] hover:text-black"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
