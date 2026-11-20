"use client";

import Link from "next/link";
import { PawPrint, Menu, X, LogOut, ArrowUpRight } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

const USER_UPDATED_EVENT = "pet-house:user-updated";

function subscribeToUser(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(USER_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(USER_UPDATED_EVENT, callback);
  };
}

function getStoredUser() {
  return localStorage.getItem("user");
}

function getServerUser() {
  return null;
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Adoptable Pets", href: "/pets" },
  { name: "Rehome a Pet", href: "/shelter/add-pet" },
];

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
];

function NavbarContent({ pathname }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const storedUser = useSyncExternalStore(subscribeToUser, getStoredUser, getServerUser);
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event(USER_UPDATED_EVENT));
    setIsOpen(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-500";
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
  };

  const accountLink = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-secondary/90 px-3 pt-4 backdrop-blur-md sm:px-5">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex min-h-[72px] items-center justify-between rounded-full border border-[#171717] bg-white px-4 shadow-sm sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Pet House home">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
              <PawPrint className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-xl font-extrabold tracking-tight sm:text-2xl">
              <span className="text-dark">Pet</span>
              <span className="text-primary">House</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="whitespace-nowrap text-sm font-semibold text-dark transition-colors duration-200 hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            {user ? (
              <>
                <Link
                  href={accountLink}
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-dark transition-colors hover:bg-secondary"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${getAvatarColor(user.name)}`}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name?.split(" ")[0] || "Account"}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full p-2 text-light transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-dark transition-colors hover:text-primary"
                >
                  Login
                </Link>
                <Link href="/register" className="btn-hero-adopt btn-register group">
                  <span className="text-sm font-semibold">Register</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary transition-colors group-hover:bg-white">
                    <PawPrint className="h-5 w-5 text-dark" />
                  </span>
                </Link>
              </>
            )}
            <Link
              href="/pets"
              className="ml-1 inline-flex items-center gap-2 rounded-full bg-[#111214] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary hover:text-dark"
            >
              Adopt Now <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 xl:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="absolute left-3 right-3 top-[calc(100%+0.5rem)] rounded-[2rem] border border-[#e9e4dc] bg-white p-4 shadow-xl sm:left-5 sm:right-5 xl:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-dark transition-colors hover:bg-secondary hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-[#eee9e1] pt-3">
              {user ? (
                <>
                  <Link href={accountLink} onClick={() => setIsOpen(false)} className="btn-secondary w-full">
                    {user.role === "admin" ? "Admin dashboard" : "My dashboard"}
                  </Link>
                  <button type="button" onClick={handleLogout} className="btn-secondary w-full">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="btn-secondary w-full">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full">
                    Create an account <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </>
              )}
              <Link href="/pets" onClick={() => setIsOpen(false)} className="btn-hero-adopt w-full">
                Adopt Now <PawPrint className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  return <NavbarContent key={pathname} pathname={pathname} />;
}
