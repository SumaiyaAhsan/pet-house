"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, PawPrint, Search } from "lucide-react";

const categories = [
  "All questions",
  "General Questions",
  "Pet Adoption",
  "Payment & Delivery",
  "For Shelters",
  "Account & Support",
];

const questions = [
  {
    id: "general-1",
    category: "General Questions",
    question: "What is PetHouse?",
    answer:
      "PetHouse brings adopters and pet owners or shelters together. Browse pet listings, learn about each companion, and start an adoption through the platform.",
  },
  {
    id: "general-2",
    category: "General Questions",
    question: "How does PetHouse work?",
    answer:
      "Browse available pets, open a listing to learn more, then sign in and follow the adoption and checkout steps. You can review your order updates from your dashboard.",
  },
  {
    id: "general-3",
    category: "General Questions",
    question: "Is registration required to use PetHouse?",
    answer:
      "You can browse public pet listings without registering. You’ll need an adopter account to place an adoption order and view your order history.",
  },
  {
    id: "general-4",
    category: "General Questions",
    question: "Is PetHouse free to use?",
    answer:
      "Browsing listings and creating an account are free. If you place an order, the pet’s listed adoption price and the delivery and platform fees are shown at checkout.",
  },
  {
    id: "adoption-1",
    category: "Pet Adoption",
    question: "How can I adopt a pet?",
    answer:
      "Choose an available pet, review its details, and select Adopt. Sign in as an adopter, provide the requested checkout information, and submit your order.",
  },
  {
    id: "adoption-2",
    category: "Pet Adoption",
    question: "Can I see a pet’s details before adopting?",
    answer:
      "Yes. Open a pet listing to see its photos, description, age, breed, location, listed-by information, and any health details provided by the owner or shelter.",
  },
  {
    id: "adoption-3",
    category: "Pet Adoption",
    question: "Are the pets vaccinated and medically checked?",
    answer:
      "Health and vaccination information varies by pet and is provided by its owner or shelter. Check the listing and contact the shelter to ask for health records before adopting.",
  },
  {
    id: "adoption-4",
    category: "Pet Adoption",
    question: "Can I adopt more than one pet?",
    answer:
      "You can place separate orders for multiple available pets. Each order is subject to that pet’s availability and the owner or shelter’s adoption process.",
  },
  {
    id: "adoption-5",
    category: "Pet Adoption",
    question: "Can I cancel my adoption order?",
    answer:
      "Contact the shelter or PetHouse support as soon as possible if you need to cancel. Whether an order can be cancelled depends on its current status.",
  },
  {
    id: "payment-1",
    category: "Payment & Delivery",
    question: "What payment methods are available?",
    answer:
      "Checkout offers Cash on Delivery and mobile banking options for bKash, Nagad, and Rocket. Available options are shown when you begin checkout.",
  },
  {
    id: "payment-2",
    category: "Payment & Delivery",
    question: "Does PetHouse support Cash on Delivery?",
    answer:
      "Yes. Select Cash on Delivery at checkout, complete the separate delivery details form, and pay the courier when your pet is delivered.",
  },
  {
    id: "payment-3",
    category: "Payment & Delivery",
    question: "What are the delivery and platform fees?",
    answer:
      "The delivery fee is ৳200 and the platform fee is ৳500. Both are added to the pet’s adoption price and shown separately in the checkout summary.",
  },
  {
    id: "payment-4",
    category: "Payment & Delivery",
    question: "How can I check my order status?",
    answer:
      "Sign in and open your adopter dashboard to view your orders, payment status, and order status.",
  },
  {
    id: "payment-5",
    category: "Payment & Delivery",
    question: "What happens after I confirm my order?",
    answer:
      "You’ll see an order confirmation and the order will appear in your dashboard. Cash on Delivery orders are confirmed for delivery; mobile banking submissions remain pending until payment is verified.",
  },
  {
    id: "shelter-1",
    category: "For Shelters",
    question: "How can a shelter register on PetHouse?",
    answer:
      "Create an account and choose the Pet Owner role during registration. After signing in, you can add and manage pet listings from your account.",
  },
  {
    id: "shelter-2",
    category: "For Shelters",
    question: "How can I add a pet to the platform?",
    answer:
      "Sign in with a Pet Owner account and use the Add Pet option to enter the pet’s details and upload a photo. New listings are reviewed before they go live.",
  },
  {
    id: "shelter-3",
    category: "For Shelters",
    question: "Can I manage my listed pets?",
    answer:
      "Yes. Your dashboard shows your pet listings and provides options to manage them, including editing listing details.",
  },
  {
    id: "shelter-4",
    category: "For Shelters",
    question: "How can I communicate with adopters?",
    answer:
      "Review relevant orders from your shelter dashboard and use the customer information available with each order to coordinate adoption and delivery details.",
  },
  {
    id: "support-1",
    category: "Account & Support",
    question: "How can I contact a shelter?",
    answer:
      "Open the pet’s detail page to review the information provided by its owner or shelter. If you can’t find a way to reach them, contact PetHouse support for help.",
  },
  {
    id: "support-2",
    category: "Account & Support",
    question: "What should I do if I face a problem with my order?",
    answer:
      "Keep your order ID handy and contact PetHouse support using the Contact Us link below. Include a short description of the issue so the team can help.",
  },
];

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("General Questions");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState("general-1");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleQuestions = questions.filter((item) => {
    if (normalizedQuery) {
      return `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(normalizedQuery);
    }

    return activeCategory === "All questions" || item.category === activeCategory;
  });
  const expandedId = visibleQuestions.some((item) => item.id === expandedQuestion)
    ? expandedQuestion
    : "";

  return (
    <section className="bg-white py-16 sm:py-24" aria-labelledby="faq-heading">
      <div className="section-wrap">
        <div className="mx-auto max-w-3xl">
          <p className="section-kicker mb-3">PetHouse help center</p>
          <h2 id="faq-heading" className="section-heading !text-[1.75rem] sm:!text-[clamp(2rem,4vw,3.5rem)]">
            Got questions? We&apos;ve <br className="sm:hidden" />
            got answers.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-light sm:text-lg">
            Everything you need to know before you meet your new companion.
          </p>

          <div className="relative mt-7 overflow-hidden rounded-[1.75rem] bg-[radial-gradient(ellipse_at_72%_28%,#70432e_0%,#35242c_48%,#17151b_100%)] px-6 py-7 text-white shadow-xl shadow-[#34251d]/15 sm:px-9 sm:py-9">
            <PawPrint
              aria-hidden="true"
              className="absolute -bottom-6 -right-3 h-36 w-36 rotate-12 text-white/[0.07] sm:h-44 sm:w-44"
            />
            <div className="relative z-10 max-w-xl">
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="h-2 w-2 rounded-full bg-primary" />
                A little help for a big decision
              </p>
              <p className="font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                Every great friendship starts with a question.
              </p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
                Find clear answers about browsing, adoption, payment, and caring connections.
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-light">
            Still curious?{" "}
            <Link href="#faq-questions" className="font-semibold text-primary underline underline-offset-4">
              Explore our FAQs
            </Link>
          </p>
        </div>

        <div id="faq-questions" className="mx-auto mt-12 max-w-3xl scroll-mt-24 sm:mt-16">
          <label htmlFor="faq-search" className="sr-only">
            Search frequently asked questions
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-light" />
            <input
              id="faq-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search questions..."
              className="input-field min-h-12 rounded-2xl border-2 border-orange-100 bg-[#fffdfa] pl-12 focus:border-primary"
            />
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible" aria-label="FAQ categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => {
                  setActiveCategory(category);
                  setSearchQuery("");
                  setExpandedQuestion(
                    questions.find((item) => category === "All questions" || item.category === category)?.id || ""
                  );
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-offset-2 ${
                  activeCategory === category
                    ? "border-primary bg-primary text-dark"
                    : "border-orange-100 bg-white text-light hover:border-orange-200 hover:text-dark"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            {visibleQuestions.length} {visibleQuestions.length === 1 ? "question" : "questions"} found
          </p>

          {visibleQuestions.length > 0 ? (
            <div className="mt-5 space-y-3">
              {visibleQuestions.map((item) => {
                const isExpanded = expandedId === item.id;
                const answerId = `faq-answer-${item.id}`;

                return (
                  <article
                    key={item.id}
                    className={`overflow-hidden rounded-2xl border-2 bg-white transition-colors duration-200 ${
                      isExpanded ? "border-primary" : "border-orange-100 hover:border-orange-200"
                    }`}
                  >
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={answerId}
                        onClick={() => setExpandedQuestion(isExpanded ? "" : item.id)}
                        className="flex min-h-[4.5rem] w-full items-center gap-4 px-4 py-4 text-left sm:px-6"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isExpanded ? "bg-primary text-dark" : "bg-[#fff0e2] text-primary"
                          }`}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                        </span>
                        <span className="font-heading text-base font-bold leading-6 text-dark sm:text-lg">
                          {item.question}
                        </span>
                      </button>
                    </h3>
                    <div id={answerId} hidden={!isExpanded} className="px-4 pb-5 pl-[4.25rem] sm:px-6 sm:pb-6 sm:pl-[5.25rem]">
                      <p className="text-sm leading-7 text-light sm:text-base">{item.answer}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border-2 border-orange-100 bg-white px-5 py-10 text-center">
              <p className="font-semibold text-dark">No matching questions found.</p>
              <p className="mt-1 text-sm text-light">Try a different search or choose another category.</p>
            </div>
          )}
        </div>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col items-start justify-between gap-5 rounded-[1.75rem] border-2 border-orange-100 bg-[#fff8f2] p-6 sm:mt-16 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="font-heading text-2xl font-bold tracking-tight text-dark">Still have questions?</p>
            <p className="mt-2 text-sm leading-6 text-light sm:text-base">
              We&apos;re here to help you find your perfect companion!
            </p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Contact Us <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
