import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Pet House",
  description: "Learn how PetHouse collects, uses, stores, and protects personal data.",
};

const LAST_UPDATED = "November 26, 2026";
const CONTACT_EMAIL = "tamannasa07@gmail.com";

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    body: [
      "This Privacy Policy explains how PetHouse collects, uses, stores, shares, and protects information when you browse the website, create an account, list a pet, apply to adopt, send messages, make a payment, or contact support.",
      "By using PetHouse, you agree to the practices described in this policy. If you do not agree, please do not use the website or provide personal information.",
    ],
  },
  {
    id: "data-we-collect",
    title: "2. Information we collect",
    body: [
      "Account information: name, email address, password credentials, account role, profile details, and account preferences.",
      "Adoption and listing information: pet photos, pet descriptions, health or behavior notes provided by shelters, adoption requirements, applications, favorites, and listing status.",
      "Communications: messages between adopters and shelters, support requests, contact form submissions, reports, and feedback.",
      "Payment information: order identifiers, amounts, currency, payment status, and transaction references. Full payment card or banking details are processed by the payment provider and are not stored by PetHouse.",
      "Technical and usage information: IP address, browser type, device information, pages visited, approximate location derived from IP, cookies or similar technologies, and authentication data stored in the browser.",
    ],
  },
  {
    id: "how-we-use",
    title: "3. How we use information",
    body: [
      "We use information to create and secure accounts, publish and manage pet listings, connect adopters with shelters, process adoption-related requests, enable messaging, respond to support requests, prevent fraud and abuse, improve the website, and comply with legal obligations.",
      "If you subscribe to updates, we use your email address to send pet care tips, new pet alerts, and service messages. You can unsubscribe from non-essential emails at any time.",
    ],
  },
  {
    id: "storage-security",
    title: "4. Storage and protection",
    body: [
      "PetHouse stores website data in a database and uses reasonable technical and organizational safeguards such as access controls, authentication checks, encrypted transport where available, limited administrative access, and monitoring for abuse.",
      "Authentication tokens and basic session data may be stored in your browser so you can stay signed in. If you use a shared or public device, log out after using PetHouse.",
      "No website, database, or transmission method is completely secure. While we work to protect information, we cannot guarantee absolute security.",
    ],
  },
  {
    id: "sharing",
    title: "5. When information is shared",
    body: [
      "Adoption-related information is shared between the adopter and the shelter or pet owner as needed to evaluate and complete an adoption.",
      "We may share information with service providers that help operate PetHouse, such as hosting, database, email, payment processing, security, analytics, and customer support providers. These providers are expected to process information only for the services they provide to PetHouse.",
      "We may disclose information if required by law, court order, animal welfare investigation, fraud prevention, or to protect the rights, safety, and property of users, animals, PetHouse, or the public.",
      "We do not sell your personal information.",
    ],
  },
  {
    id: "cookies-local-storage",
    title: "6. Cookies and browser storage",
    body: [
      "PetHouse may use cookies, local storage, or similar technologies for login sessions, security, preferences, and basic analytics. Some features may not work if these technologies are disabled.",
      "You can clear cookies and local storage through your browser settings, but doing so may sign you out and reset saved preferences.",
    ],
  },
  {
    id: "retention",
    title: "7. Data retention",
    body: [
      "We keep account and listing information while the account is active and for a reasonable period afterward to operate the service, resolve disputes, prevent abuse, maintain records, and comply with legal obligations.",
      "When information is no longer needed, we delete it, anonymize it, or securely archive it where deletion is not immediately practical.",
    ],
  },
  {
    id: "your-rights",
    title: "8. Your choices and rights",
    body: [
      "Depending on your location, you may have rights to access, correct, export, restrict, or delete your personal information, and to object to certain processing.",
      `To exercise a privacy request, contact us at ${CONTACT_EMAIL} or through the contact page. We may need to verify your identity before completing a request.`,
      "You can unsubscribe from optional newsletters, edit some profile details from your account, and request deletion of your account. Some records may be retained where legally required or needed for safety and fraud prevention.",
    ],
  },
  {
    id: "children",
    title: "9. Children's privacy",
    body: [
      "PetHouse is not directed to children under the minimum age required by applicable law. Parents or guardians should supervise any use by minors and should contact us if a child has provided personal information without permission.",
      "If we learn that we collected personal information from a child without required consent, we will take reasonable steps to delete it.",
    ],
  },
  {
    id: "international",
    title: "10. International processing",
    body: [
      "If you use PetHouse from outside the country where our servers or service providers are located, your information may be processed across borders. We take reasonable steps to protect information consistent with this policy and applicable law.",
    ],
  },
  {
    id: "changes-contact",
    title: "11. Changes and contact",
    body: [
      "We may update this Privacy Policy as the website, legal requirements, or data practices change. Material updates will be reflected by changing the last updated date and, where practical, by providing notice through the website or email.",
      `Privacy questions and requests can be sent to ${CONTACT_EMAIL} or through the contact page.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <article className="py-16 sm:py-24">
      <div className="section-wrap">
        <header className="mx-auto max-w-3xl text-center">
          <p className="section-kicker mb-3">Privacy</p>
          <h1 className="section-heading">Privacy Policy</h1>
          <p className="mt-5 text-sm leading-7 text-light sm:text-base">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-4 text-sm leading-7 text-light sm:text-base">
            This policy explains what PetHouse collects, why it is used, how it is stored and protected, when it is shared, and the choices you have.
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
              Privacy questions or requests?
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Contact us for access, correction, deletion, unsubscribe, or general privacy questions.
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