"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const petSlides = [
  {
    src: "/p-3.jpg",
    animal: "dog",
    headline: "Find Your Loyal Best Friend",
  },
  {
    src: "/p-1.jpg",
    animal: "cat",
    headline: "A Purr-fect Match Awaits",
  },
  {
    src: "/p-2.jpg",
    animal: "bird",
    headline: "Spread Your Wings With a New Friend",
  },
  {
    src: "/p-4.jpg",
    animal: "bird",
    headline: "A Little Pocket of Happiness",
  },
  {
    src: "/p-5.jpg",
    animal: "bird",
    headline: "Spread Your Wings With a New Friend",
  },
  {
    src: "/p-6.jpg",
    animal: "rabbit",
    headline: "Hop Into a New Beginning",
  },
];

export default function HeroPetCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % petSlides.length);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex]);

  return (
    <div
      className="hero-pet-carousel"
      role="region"
      aria-label="Featured pets"
      aria-roledescription="carousel"
    >
      <div className="hero-pet-carousel__scene">
        {petSlides.map((slide, index) => (
          <article
            key={slide.src}
            className={`hero-pet-carousel__slide${index === activeIndex ? " hero-pet-carousel__slide--active" : ""}`}
            aria-hidden={index !== activeIndex}
            aria-label={`${index + 1} of ${petSlides.length}: ${slide.headline}`}
            role="group"
            aria-roledescription="slide"
          >
            <div className="hero-pet-carousel__copy">
              <p className="hero-pet-carousel__kicker">Meet your match</p>
              <h1 className="hero-title">{slide.headline}</h1>
            </div>
            <div className="hero-pet-carousel__image">
              <Image
                src={slide.src}
                alt={`A ${slide.animal} ready to meet you`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          </article>
        ))}
      </div>
      <div className="hero-pet-carousel__indicators" aria-label="Choose a featured pet">
        {petSlides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={`hero-pet-carousel__indicator${index === activeIndex ? " hero-pet-carousel__indicator--active" : ""}`}
            aria-label={`Show ${slide.animal}: ${slide.headline}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
