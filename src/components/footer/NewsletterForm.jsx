"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const isSubmitting = status === "submitting";

  async function handleSubmit(event) {
    event.preventDefault();

    const emailAddress = email.trim();

    if (!EMAIL_PATTERN.test(emailAddress)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      // TODO: Replace this simulated request with a POST to /api/newsletter.
      // fetch("/api/newsletter", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: emailAddress }),
      // })
      await new Promise((resolve) => setTimeout(resolve, 700));

      setStatus("success");
      setMessage("Thanks for subscribing. Watch your inbox for pet care tips.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="w-full">
          <label htmlFor="footer-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
            aria-invalid={status === "error"}
            aria-describedby="footer-newsletter-message"
            className="h-12 w-full rounded-xl border border-white/[0.12] bg-[#17191C] px-4 text-sm text-white placeholder:text-white/40 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="h-4 w-4" />
          )}
          <span>{isSubmitting ? "Subscribing" : "Subscribe"}</span>
        </button>
      </div>

      <p
        id="footer-newsletter-message"
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
        className={`mt-3 flex min-h-5 items-center gap-2 text-sm ${
          status === "error" ? "text-[#FFB4A2]" : "text-[#9DE6B8]"
        }`}
      >
        {message ? (
          <>
            {status === "error" ? (
              <AlertCircle aria-hidden="true" className="h-4 w-4" />
            ) : (
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            )}
            <span>{message}</span>
          </>
        ) : null}
      </p>
    </form>
  );
}
