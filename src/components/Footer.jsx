import Link from "next/link";
import { ArrowUpRight, Mail, PawPrint } from "lucide-react";
import FooterColumn from "@/components/footer/FooterColumn";
import NewsletterForm from "@/components/footer/NewsletterForm";
import SocialLinks from "@/components/footer/SocialLinks";

const EXPLORE_LINKS = [
  { label: "Browse pets", href: "/pets" },
  { label: "Rehome a pet", href: "/shelter/add-pet" },
  { label: "Create an account", href: "/register" },
  { label: "Login", href: "/login" },
  { label: "Contact Us", href: "/contact" },
];

const COMPANY_POLICY_LINKS = [
  { label: "FAQ", href: "/#faq-questions" },
  { label: "About Us", href: "/#about" },
  { label: "Pet Care Guides", href: "/pet-care" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/pethouse", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com/pethouse", icon: "instagram" },
  { label: "YouTube", href: "https://www.youtube.com/@pethouse", icon: "youtube" },
  { label: "X (Twitter)", href: "https://x.com/pethouse", icon: "twitter" },
];

const CONTACT_LINKS = [
  {
    label: "Email",
    value: "tamannasa07@gmail.com",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=tamannasa07%40gmail.com",
    icon: Mail,
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="mt-16 bg-[#111214] text-white">
      <div className="section-wrap py-16 sm:py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 xl:grid-cols-12 xl:gap-x-10">
          <div className="col-span-2 xl:col-span-4">
            <Link href="/" className="mb-6 inline-flex items-center gap-3">
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
            <SocialLinks links={SOCIAL_LINKS} className="mt-8" />
          </div>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} className="col-span-1 xl:col-span-2" />
          <FooterColumn
            title="Company & Policies"
            links={COMPANY_POLICY_LINKS}
            className="col-span-1 xl:col-span-3"
          />

          <div className="col-span-2 xl:col-span-3">
            <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A8F94]">
              For Shelters
            </h2>
            <p className="mb-6 max-w-sm text-sm leading-7 text-white/65">
              Share a pet listing and connect with people looking for a new companion.
            </p>
            <Link
              href="/shelter/add-pet"
              aria-label="List a pet"
              title="List a pet"
              className="btn-hero-adopt w-fit px-6"
            >
              <span>List a pet</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 border-t border-white/[0.08] pt-12 md:grid-cols-2 md:gap-x-10 xl:grid-cols-12">
          <section aria-labelledby="footer-contact-heading" className="xl:col-span-4">
            <h2
              id="footer-contact-heading"
              className="mb-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A8F94]"
            >
              Contact Us
            </h2>
            <p className="mb-6 max-w-sm text-sm leading-7 text-white/65">
              Questions about adoption, listings, or your account? Send a note and the PetHouse team will help.
            </p>
            <ul className="space-y-3">
              {CONTACT_LINKS.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-flex items-center gap-3 rounded-sm py-1 text-sm text-[#C9CDD1] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1F22] text-white transition-colors duration-200 group-hover:bg-primary">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <span>{item.value}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/contact"
              className="group mt-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-white transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214]"
            >
              <span>Send us a message</span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </section>

          <section aria-labelledby="footer-newsletter-heading" className="xl:col-span-8">
            <h2
              id="footer-newsletter-heading"
              className="mb-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A8F94]"
            >
              Stay Updated
            </h2>
            <p className="mb-6 max-w-2xl text-sm leading-7 text-white/65">
              Get pet care tips and new pets looking for homes in your inbox.
            </p>
            <NewsletterForm />
          </section>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section-wrap flex flex-col items-center justify-center gap-3 py-6 text-center text-xs text-white/50 sm:flex-row sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} Pet House. All rights reserved.</p>
          <p>Made with care for pets and their people.</p>
        </div>
      </div>
    </footer>
  );
}
