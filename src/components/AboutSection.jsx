"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  HeartPulse,
  Home as HomeIcon,
  MessageCircle,
  PawPrint,
  ShieldCheck,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const purposeCards = [
  {
    icon: PawPrint,
    title: "Adopt a pet",
    description:
      "Browse verified listings of dogs, cats, birds, rabbits and more. Every pet comes with photos, a story, and clear adoption details.",
    href: "/pets",
    linkLabel: "Browse pets",
  },
  {
    icon: HomeIcon,
    title: "List a pet for adoption",
    description:
      "Shelters and pet owners can introduce their pets, manage listings, and reach families who are ready to give a loving home.",
    href: "/shelter/add-pet",
    linkLabel: "Donate a pet",
  },
  {
    icon: MessageCircle,
    title: "Chat directly",
    description:
      "Ask questions and talk in real time with the pet's owner or shelter before you decide, so every match starts with understanding.",
    href: "/messages",
    linkLabel: "Open messages",
  },
  {
    icon: ShieldCheck,
    title: "Safe, simple adoption",
    description:
      "Apply, confirm, and pay securely online or with cash on delivery. Adoption is designed to be clear at every step.",
    href: "/pets",
    linkLabel: "Start adopting",
  },
  {
    icon: HeartPulse,
    title: "Pet Care guidance",
    description:
      "After adoption, find disease, symptom, medicine, and prevention guides for every pet category in our Pet Care hub.",
    href: "/pet-care",
    linkLabel: "Explore Pet Care",
  },
];

export default function AboutSection() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    // Users who prefer reduced motion get a normal, swipeable row instead.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      viewport.style.overflowX = "auto";
      return;
    }

    let raf = null;

    const update = () => {
      raf = null;
      const rect = viewport.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const start = viewportHeight * 0.9;
      const end = Math.max(0, Math.min(viewportHeight * 0.3, viewportHeight - rect.height));
      const progress = Math.min(
        1,
        Math.max(0, (start - rect.top) / Math.max(1, start - end))
      );
      const maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth);
      track.style.transform = `translate3d(${(-progress * maxShift).toFixed(1)}px, 0, 0)`;
    };

    const requestUpdate = () => {
      if (raf === null) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (raf !== null) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="overflow-hidden bg-white py-20 sm:py-28"
    >
      <div className="section-wrap">
        <div className="grid items-end gap-6 md:grid-cols-[1.2fr_0.8fr] md:gap-10">
          <ScrollReveal>
            <p className="section-kicker mb-3">About Pet House</p>
            <h2 id="about-heading" className="section-heading max-w-2xl">
              One platform for every step of pet adoption
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100} className="max-w-lg pb-1 text-base leading-7 text-light">
            Pet House is an online pet adoption platform. We connect people who want to adopt with
            the shelters and owners caring for pets, so finding, meeting, and bringing home a new
            companion all happens in one trusted place.
          </ScrollReveal>
        </div>
      </div>

      <ScrollReveal delay={150} className="mt-10 md:mt-14">
        <div ref={viewportRef} className="overflow-hidden">
          <ul
            ref={trackRef}
            className="flex w-max gap-4 pl-5 pr-5 will-change-transform sm:pl-[max(1.25rem,calc((100vw-1200px)/2+1.25rem))]"
          >
            {purposeCards.map((card) => {
              const Icon = card.icon;
              return (
                <li key={card.title} className="w-[280px] shrink-0 sm:w-[330px]">
                  <article className="flex h-full flex-col rounded-[1.75rem] border-2 border-orange-100 bg-secondary p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ffbd8a] hover:bg-[#fff1e6] hover:shadow-lg sm:p-7">
                    <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-heading text-xl font-bold text-dark">{card.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-light">{card.description}</p>
                    <Link
                      href={card.href}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#df531a] transition-colors hover:text-dark"
                    >
                      {card.linkLabel}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </ScrollReveal>
    </section>
  );
}
