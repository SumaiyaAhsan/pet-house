import Link from "next/link";
import { ArrowUpRight, PawPrint } from "lucide-react";

const footerLinks = [
  { label: "Browse pets", href: "/pets" },
  { label: "Rehome a pet", href: "/shelter/add-pet" },
  { label: "Create an account", href: "/register" },
  { label: "Login", href: "/login" },
  { label: "Contact Us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer id="contact" className="mt-16 bg-[#111214] text-white">
      <div className="section-wrap grid gap-12 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-20">
        <div>
          <Link href="/" className="mb-5 inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
              <PawPrint className="h-6 w-6" />
            </span>
            <span className="font-heading text-2xl font-extrabold tracking-tight">
              Pet<span className="text-primary">House</span>
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-7 text-white/65">
            Helping pets and people find each other through thoughtful adoption and trusted shelter connections.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Explore</p>
          <ul className="space-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-primary"
                >
                  {link.label} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white/45">For shelters</p>
          <p className="mb-5 text-sm leading-7 text-white/65">
            Share a pet listing and connect with people looking for a new companion.
          </p>
          <Link
            href="/shelter/add-pet"
            aria-label="List a pet"
            title="List a pet"
            className="btn-hero-adopt"
          >
            <span>List a pet</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section-wrap flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Pet House. All rights reserved.</p>
          <p>Made with care for pets and their people.</p>
        </div>
      </div>
    </footer>
  );
}
