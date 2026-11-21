"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "",
  topic: "adoption",
  email: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Your message could not be sent.");

      setForm(initialForm);
      setStatus({ type: "success", message: data.message });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Your message could not be sent. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border-2 border-orange-100 bg-white p-5 shadow-sm sm:p-7 lg:p-8"
    >
      <div className="mb-6">
        <p className="section-kicker mb-2">Send us a message</p>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-dark sm:text-3xl">
          How can we help?
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-first-name" className="mb-2 block text-sm font-semibold text-dark">
            First name
          </label>
          <input
            id="contact-first-name"
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={updateField}
            maxLength={80}
            required
            className="input-field"
            placeholder="First name"
          />
        </div>
        <div>
          <label htmlFor="contact-last-name" className="mb-2 block text-sm font-semibold text-dark">
            Last name
          </label>
          <input
            id="contact-last-name"
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={updateField}
            maxLength={80}
            required
            className="input-field"
            placeholder="Last name"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-2 block text-sm font-semibold text-dark">
            Phone <span className="font-normal text-light">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={updateField}
            maxLength={32}
            className="input-field"
            placeholder="Your phone number"
          />
        </div>
        <div>
          <label htmlFor="contact-topic" className="mb-2 block text-sm font-semibold text-dark">
            Topic
          </label>
          <select
            id="contact-topic"
            name="topic"
            value={form.topic}
            onChange={updateField}
            className="input-field"
          >
            <option value="adoption">Pet adoption</option>
            <option value="order">Order support</option>
            <option value="listing">Pet listing</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-dark">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={updateField}
            maxLength={254}
            required
            className="input-field"
            placeholder="you@example.com"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-dark">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={updateField}
            minLength={10}
            maxLength={4000}
            rows={5}
            required
            className="input-field resize-y"
            placeholder="Tell us how we can help..."
          />
        </div>
      </div>

      {status.message && (
        <p
          role={status.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            status.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary mt-6 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Sending..." : "Send message"}
        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </button>
      <p className="mt-3 text-xs leading-5 text-light">
        Your message will be sent to the PetHouse admin. We&apos;ll use your email to reply.
      </p>
    </form>
  );
}
