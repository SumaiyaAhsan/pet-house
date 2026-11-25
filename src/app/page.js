import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Heart,
  HeartHandshake,
  Home as HomeIcon,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import FeaturedPets from "@/components/FeaturedPets";
import FAQSection from "@/components/FAQSection";
import HeroPetCarousel from "@/components/HeroPetCarousel";

const adoptionSteps = [
  {
    number: "01",
    icon: PawPrint,
    title: "Meet the pets",
    description: "Browse approved listings and find a companion who feels right for you.",
  },
  {
    number: "02",
    icon: Heart,
    title: "Get to know them",
    description: "Explore each pet's story, details, and adoption information.",
  },
  {
    number: "03",
    icon: HeartHandshake,
    title: "Connect with a shelter",
    description: "Reach out to the people caring for your future companion.",
  },
  {
    number: "04",
    icon: HomeIcon,
    title: "Make room for love",
    description: "Take the next step toward giving a pet a safe, caring home.",
  },
];

const platformFeatures = [
  {
    icon: ShieldCheck,
    title: "Reviewed pet listings",
    description: "New listings are reviewed before they appear in the adoption marketplace.",
  },
  {
    icon: HeartHandshake,
    title: "A more personal match",
    description: "Learn about each pet and connect with the people who know them best.",
  },
  {
    icon: HomeIcon,
    title: "For shelters and adopters",
    description: "A shared place to introduce pets, explore adoption, and manage listings.",
  },
];

const petCategories = [
  { name: "Bird", species: "Bird", image: "/bird.jpg" },
  { name: "Cat", species: "Cat", image: "/cat.jpg" },
  { name: "Dog", species: "Dog", image: "/dog.jpg" },
  { name: "Rabbit", species: "Rabbit", image: "/rabbit 🐇.jpeg" },
  { name: "Hamster", species: "Hamster", image: "/ham.jpg" },
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-secondary">
      <section className="hero-section">
        <PawPrint
          aria-hidden="true"
          className="absolute left-[5%] top-24 hidden h-20 w-20 -rotate-12 text-dark/25 md:block"
        />
        <PawPrint
          aria-hidden="true"
          className="absolute right-[5%] top-28 hidden h-16 w-16 rotate-12 text-dark/25 md:block"
        />

        <div className="hero-content">
          <HeroPetCarousel />
          <p className="hero-description">
            Find a friend who fits your life. Pet House brings adopters and shelters together to help
            more pets find a loving home.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/pets" className="btn-hero-adopt group w-full sm:w-auto">
              <span>Adopt Now</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary transition-colors group-hover:bg-[#fff1e6]">
                <PawPrint className="h-4 w-4 text-dark" />
              </span>
            </Link>
            <Link href="/shelter/add-pet" className="btn-hero-donate w-full sm:w-auto">
              <span>Donate Pets</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10" aria-labelledby="pet-categories-heading">
        <div className="section-wrap">
          <div className="mb-7 flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-7 w-7 text-primary" />
            <h2 id="pet-categories-heading" className="font-heading text-2xl font-bold tracking-tight text-dark sm:text-3xl">
              Top Categories
            </h2>
          </div>
          <ul className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
            {petCategories.map((category) => (
              <li key={category.species} className="w-full">
                <Link
                  href={`/pets?species=${encodeURIComponent(category.species)}`}
                  aria-label={`Browse ${category.name} pets`}
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl px-2 py-2 text-center transition-transform hover:-translate-y-1 focus-visible:outline-offset-4"
                >
                  <span className="relative block aspect-square w-full max-w-[176px] rounded-full border-[3px] border-orange-200 bg-secondary p-1 transition-all group-hover:border-[#ffbd8a] group-hover:shadow-[0_0_0_6px_#fff1e6]">
                    <span className="relative block h-full w-full overflow-hidden rounded-full">
                      <Image
                        src={category.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 176px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                  </span>
                  <span className="font-heading text-base font-bold text-dark sm:text-lg">
                    {category.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="section-wrap py-20 sm:py-28">
        <div className="mx-auto mb-11 max-w-2xl text-center sm:mb-14">
          <p className="section-kicker mb-3">A simple way to start</p>
          <h2 className="section-heading">Find your new best friend in four steps</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adoptionSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} className="rounded-[1.75rem] border-2 border-orange-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ffbd8a] hover:bg-[#fffaf5] hover:shadow-lg sm:p-7">
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-heading text-sm font-bold tracking-widest text-[#aaa69e]">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-dark">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-light">{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <FeaturedPets />

      <section id="about" className="bg-white py-20 sm:py-28">
        <div className="section-wrap">
          <div className="grid items-end gap-6 md:grid-cols-[1.2fr_0.8fr] md:gap-10">
            <div>
              <p className="section-kicker mb-3">Why Pet House</p>
              <h2 className="section-heading max-w-2xl">
                A thoughtful start to a lifelong friendship
              </h2>
            </div>
            <p className="max-w-lg pb-1 text-base leading-7 text-light">
              Adoption should feel clear, caring, and personal. We bring the important details and
              people together so every connection can begin with confidence.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
            {platformFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-[1.75rem] border-2 border-orange-100 bg-secondary p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ffbd8a] hover:bg-[#fff1e6] hover:shadow-lg sm:p-8">
                  <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-heading text-xl font-bold text-dark">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-light">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <FAQSection />

      <section className="section-wrap py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-center text-dark sm:px-12 sm:py-16">
          <PawPrint
            aria-hidden="true"
            className="absolute -bottom-6 -right-4 h-40 w-40 rotate-12 text-white/15 sm:h-56 sm:w-56"
          />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-dark/65">
              Ready when you are
            </p>
            <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              A new best friend could be one click away.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-dark/75 sm:text-base">
              Browse the pets waiting to meet you, or help a pet find their next home.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/pets" className="btn-primary bg-dark hover:bg-[#FF9B55] hover:text-black">
                Browse adoptable pets <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/shelter/add-pet" className="btn-secondary border-dark/20 bg-white/70">
                Donate Pets <PawPrint className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}