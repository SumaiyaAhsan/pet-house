import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { Heart, Mail, MessageCircle, PawPrint } from "lucide-react";

export const metadata = {
  title: "Contact PetHouse | Adopt & Care",
  description: "Contact PetHouse for help with pet adoption, orders, and listings.",
};

const contactTopics = [
  {
    icon: PawPrint,
    title: "Adoption questions",
    description: "Ask us about finding the right companion or starting an adoption.",
  },
  {
    icon: MessageCircle,
    title: "Order support",
    description: "Include your order ID so we can help with an existing order.",
  },
  {
    icon: Mail,
    title: "Direct reply",
    description: "Your message goes to the PetHouse admin, with your email ready for a reply.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <section className="section-wrap py-12 sm:py-16 lg:py-20">
        <header className="mx-auto max-w-2xl text-center">
          <p className="section-kicker mb-3">We&apos;re here to help</p>
          <h1 className="section-heading">Let&apos;s connect</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-light sm:text-base">
            Have a question about adopting, an order, or listing a pet? Send us a message and the
            PetHouse admin team will get back to you by email.
          </p>
        </header>

        <div className="mt-9 grid items-stretch gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-7">
          <ContactForm />

          <aside className="relative isolate min-h-[24rem] overflow-hidden rounded-[1.75rem] border-2 border-white bg-[#2c3324] shadow-xl shadow-[#34251d]/10 sm:min-h-[34rem]">
            <Image
              src="/contact-pet.png"
              alt="A woman sharing a happy moment with her dog"
              fill
              preload
              sizes="(max-width: 1023px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10130f]/85 via-[#10130f]/10 to-transparent" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:left-7 sm:top-7">
              <Heart className="h-4 w-4 fill-primary text-primary" />
              Here for pets and their people
            </div>
            <div className="absolute inset-x-5 bottom-6 text-white sm:inset-x-8 sm:bottom-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/75">
                Every connection matters
              </p>
              <h2 className="max-w-md font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                We&apos;re glad you reached out.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                Tell us how we can help you take the next step for a pet.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {contactTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <article
                key={topic.title}
                className="rounded-2xl border-2 border-orange-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:p-6"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0e8] text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="font-heading text-lg font-bold text-dark">{topic.title}</h2>
                <p className="mt-2 text-sm leading-6 text-light">{topic.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
