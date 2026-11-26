import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | Pet House",
  description: "Read the terms and conditions for using PetHouse.",
};

const LAST_UPDATED = "November 26, 2026";
const CONTACT_EMAIL = "tamannasa07@gmail.com";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of these terms",
    body: [
      "These Terms and Conditions govern your access to and use of PetHouse. By creating an account, browsing listings, contacting a shelter, listing a pet, or using any part of the website, you agree to these terms.",
      "If you do not agree with these terms, do not use PetHouse. If you are using PetHouse on behalf of a shelter, rescue, or other organization, you confirm that you are authorized to accept these terms for that organization.",
    ],
  },
  {
    id: "service",
    title: "2. What PetHouse does",
    body: [
      "PetHouse is an online platform that helps people discover pets available for adoption and helps shelters or pet owners connect with potential adopters. PetHouse may also provide pet care information, messaging, account tools, and related features.",
      "PetHouse is not the seller, breeder, shelter, veterinarian, or owner of the pets listed unless a listing clearly says otherwise. Adoption decisions, screening, meet-and-greets, medical checks, vaccination records, transfer paperwork, and final handover are the responsibility of the adopter and the shelter or pet owner.",
    ],
  },
  {
    id: "accounts",
    title: "3. Accounts and roles",
    body: [
      "You must provide accurate and current information when creating an account. You are responsible for keeping your login credentials confidential and for all activity that happens through your account.",
      "PetHouse may offer different account roles, such as adopter, shelter, and admin. Shelter accounts are responsible for the accuracy of their listings and for having the legal right to rehome the pets they publish.",
      "We may suspend or remove an account if we believe it is being used for fraud, spam, animal welfare violations, harassment, security abuse, or any breach of these terms.",
    ],
  },
  {
    id: "listings",
    title: "4. Pet listings and animal welfare",
    body: [
      "Listings must be truthful, current, and not misleading. Shelters and pet owners must accurately describe the pet's species, breed or mix, age, sex, size, health status, behavior notes, location, and adoption requirements to the best of their knowledge.",
      "You may not list animals that are illegal to sell, adopt, transport, or possess in your location. You may not use PetHouse for puppy mills, animal fighting, bait animals, endangered species trafficking, or any activity that harms animal welfare.",
      "PetHouse may remove or hide a listing that appears unsafe, deceptive, abusive, or unlawful.",
    ],
  },
  {
    id: "adoptions-payments",
    title: "5. Adoptions, fees, and payments",
    body: [
      "Any adoption fee, donation, reservation fee, or similar charge is between the adopter and the shelter or pet owner unless PetHouse expressly states that it is collecting that payment.",
      "If a payment is processed through PetHouse, the payment may be handled by a third-party payment processor. PetHouse does not store full card numbers or sensitive banking credentials on its own servers.",
      "Refund eligibility for adoption-related payments should be stated in the applicable adoption and refund policy. PetHouse is not responsible for disputes between adopters and shelters, except where required by law or expressly stated by PetHouse.",
    ],
  },
  {
    id: "messages",
    title: "6. Messages and user conduct",
    body: [
      "PetHouse may allow adopters and shelters to message each other. You agree not to use messages for scams, harassment, threats, hate speech, sexual solicitation, spam, phishing, or requests for off-platform payment intended to avoid safety or accountability measures.",
      "Do not share another person's private information without permission. Report suspicious adoption requests, payment requests, or abusive messages through the contact page.",
    ],
  },
  {
    id: "content",
    title: "7. Content and intellectual property",
    body: [
      "You keep ownership of the text, photos, and other content you submit, but you grant PetHouse a non-exclusive, worldwide, royalty-free license to host, store, display, reproduce, and distribute that content as needed to operate and promote the service.",
      "You confirm that you own or have permission to use the content you upload, including pet photos, and that the content does not infringe another person's rights.",
      "The PetHouse name, logo, design, software, and website content are owned by or licensed to PetHouse and may not be copied or reused without permission.",
    ],
  },
  {
    id: "prohibited",
    title: "8. Prohibited activity",
    body: [
      "You may not scrape, crawl, or bulk-download listings without permission; probe or bypass security; upload malware; impersonate another person or organization; create fake adoption listings; manipulate reviews or messages; or use PetHouse in a way that violates law or these terms.",
      "Automated access must respect rate limits, robots directives, and any technical controls on the website.",
    ],
  },
  {
    id: "third-party",
    title: "9. Third-party services and links",
    body: [
      "PetHouse may link to or rely on third-party services such as payment processors, maps, email providers, analytics tools, or external pet care resources. Third-party services have their own terms and privacy policies.",
      "PetHouse is not responsible for the content, availability, security, or practices of third-party websites or services.",
    ],
  },
  {
    id: "disclaimers",
    title: "10. Disclaimers",
    body: [
      "PetHouse is provided on an as-is and as-available basis. We do not guarantee that a listing is accurate, that a pet is healthy, that an adoption will be completed, or that the website will always be uninterrupted or error-free.",
      "Pet care content on PetHouse is general information and is not veterinary advice. For diagnosis, treatment, medication, emergencies, or behavior concerns, consult a licensed veterinarian.",
    ],
  },
  {
    id: "liability",
    title: "11. Limitation of liability",
    body: [
      "To the maximum extent allowed by law, PetHouse and its team will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, lost goodwill, or adoption disputes arising from listings, messages, payments, shelter decisions, pet behavior, or third-party services.",
      "Where liability cannot be excluded, it is limited to the amount you paid to PetHouse for the specific paid feature giving rise to the claim during the three months before the event, or the minimum amount allowed by law.",
    ],
  },
  {
    id: "termination",
    title: "12. Suspension and termination",
    body: [
      "You may stop using PetHouse at any time and may request account deletion through the available account or contact options.",
      "We may suspend or terminate access if you breach these terms, create risk for users or animals, or if continued access would expose PetHouse or others to legal or security harm.",
    ],
  },
  {
    id: "changes",
    title: "13. Changes to these terms",
    body: [
      "We may update these terms from time to time. When we do, we will change the last updated date and, for material changes, provide reasonable notice through the website or by email where practical.",
      "Continued use of PetHouse after updated terms take effect means you accept the updated terms.",
    ],
  },
  {
    id: "law-contact",
    title: "14. Governing law and contact",
    body: [
      "These terms are governed by the laws of your operating jurisdiction, unless a different jurisdiction is required by law.",
      `Questions about these terms can be sent to ${CONTACT_EMAIL} or through the contact page.`,
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <article className="py-16 sm:py-24">
      <div className="section-wrap">
        <header className="mx-auto max-w-3xl text-center">
          <p className="section-kicker mb-3">Legal</p>
          <h1 className="section-heading">Terms &amp; Conditions</h1>
          <p className="mt-5 text-sm leading-7 text-light sm:text-base">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-4 text-sm leading-7 text-light sm:text-base">
            These terms explain the rules for using PetHouse, including accounts, listings, adoptions, payments, messages, and acceptable use.
          </p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="rounded-3xl border border-[#e9e4da] bg-white p-6 shadow-sm sm:p-8"
            >
              <h2
                id={`${section.id}-heading`}
                className="font-heading text-xl font-bold tracking-tight text-dark sm:text-2xl"
              >
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-light sm:text-[15px]">
                {section.body.map((paragraph, index) => (
                  <p key={`${section.id}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-3xl bg-dark p-6 text-white shadow-sm sm:p-8">
            <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              Questions about these terms?
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Contact the PetHouse team and we will point you to the right policy or support flow.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
              >
                Contact us
              </Link>
              
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}