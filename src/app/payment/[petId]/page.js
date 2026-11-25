"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Check,
  LockKeyhole,
  MapPin,
  PawPrint,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { DELIVERY_FEE, PLATFORM_FEE } from "@/lib/payments/fees";

const paymentMethods = [
  {
    id: "cash_on_delivery",
    name: "Cash on Delivery",
    description: "Pay when your pet is delivered",
    initials: "COD",
    iconClass: "bg-[#111214]/5 text-[#111214]",
  },
  {
    id: "bkash",
    name: "bKash",
    description: "Pay with your bKash account",
    initials: "bK",
    iconClass: "bg-[#e2136e]/10 text-[#e2136e]",
  },
  {
    id: "nagad",
    name: "Nagad",
    description: "Pay with your Nagad account",
    initials: "N",
    iconClass: "bg-[#f7941d]/15 text-[#c56a00]",
  },
  {
    id: "rocket",
    name: "Rocket",
    description: "Pay with DBBL Rocket",
    initials: "R",
    iconClass: "bg-[#6f2c91]/10 text-[#6f2c91]",
  },
];

function formatTaka(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export default function AdoptionPaymentPage() {
  const { petId } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState(null);
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("bkash");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loginUrl = `/login?next=${encodeURIComponent(`/payment/${petId}`)}`;
    if (!token) {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("pet-house:user-updated"));
      toast.error("Please log in to continue with an adoption.");
      router.replace(loginUrl);
      return;
    }

    let active = true;
    let redirectingToLogin = false;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`/api/pets/${petId}?optimized=1`),
      fetch("/api/user/profile", { headers }),
    ])
      .then(async ([petResponse, userResponse]) => {
        const petData = await petResponse.json();
        if (!petResponse.ok) throw new Error(petData.error || "Could not load this pet.");

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            redirectingToLogin = true;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("pet-house:user-updated"));
            toast.error("Your session has expired. Please sign in again.");
            router.replace(loginUrl);
            return;
          }
          const userError = await userResponse.json();
          throw new Error(userError.error || "Could not load your account.");
        }
        const userData = await userResponse.json();

        if (active) {
          setPet(petData);
          setUser(userData);
          setPhone(userData.phone || "");
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error.message);
          toast.error(error.message);
        }
      })
      .finally(() => {
        if (active && !redirectingToLogin) setLoading(false);
      });

    const paymentStatus = new URLSearchParams(window.location.search).get("payment");
    if (paymentStatus === "cancelled") {
      toast("Payment cancelled. You can try again when you are ready.");
    } else if (paymentStatus === "failed") {
      toast.error("Payment was not completed. Please try again.");
    }

    return () => {
      active = false;
    };
  }, [petId, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!pet) return;

    if (selectedMethod === "cash_on_delivery") {
      router.push(`/payment/${pet._id}/cod`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to continue with an adoption.");
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/payment/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petId: pet._id,
          paymentMethod: selectedMethod,
          paymentDetails: {
            mobileNumber: phone,
            transactionId,
          },
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Unable to start checkout.");
      if (!data.orderId) throw new Error("The order could not be confirmed.");
      router.push(`/payment/confirmation/${data.orderId}`);
    } catch (error) {
      toast.error(error.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-secondary px-4 text-light">
        Loading secure checkout...
      </main>
    );
  }

  if (errorMessage || !pet || !user) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-secondary px-4 text-center">
        <p className="text-light">{errorMessage || "Unable to load checkout."}</p>
        <Link href="/pets" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to adoptable pets
        </Link>
      </main>
    );
  }

  const listedAmount = Number(pet.price);
  const roundedAmount = Math.round(listedAmount * 100) / 100;
  const hasValidFee =
    Number.isFinite(listedAmount) &&
    listedAmount >= 0 &&
    roundedAmount === listedAmount;
  const isFreeAdoptionFee = hasValidFee && listedAmount === 0;
  const totalAmount = roundedAmount + DELIVERY_FEE + PLATFORM_FEE;
  const isCashOnDelivery = selectedMethod === "cash_on_delivery";
  const isAvailable = pet.status === "approved" && user.role === "user";
  const canContinue = hasValidFee && totalAmount > 0;

  return (
    <main className="min-h-screen bg-secondary px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/pets/${pet._id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-light transition-colors hover:text-[#b94b00]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {pet.name}
        </Link>

        <div className="mb-7">
          <p className="section-kicker mb-2">Secure adoption checkout</p>
          <h1 className="section-heading !text-3xl sm:!text-4xl">Select payment method</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-light">
            Choose cash on delivery or submit mobile banking payment details for verification.
          </p>
        </div>

        {!isAvailable ? (
          <div className="rounded-3xl border border-[#ebe7df] bg-white p-8 text-center shadow-sm">
            <PawPrint className="mx-auto mb-3 h-10 w-10 text-primary" />
            <p className="font-semibold text-dark">
              {pet.status !== "approved"
                ? "This pet is no longer available for adoption."
                : "Only adopter accounts can adopt a pet."}
            </p>
            <Link href={`/pets/${pet._id}`} className="btn-primary mt-5">
              Return to pet details
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]"
          >
            <section className="rounded-3xl border border-[#ebe7df] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0e8] text-primary">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-dark">Mobile financial services</h2>
                  <p className="text-sm text-light">Select your preferred payment method.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {paymentMethods.map((method) => {
                  const selected = selectedMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                        selected
                          ? "border-primary bg-[#fff8f3] ring-2 ring-primary/15"
                          : "border-[#ebe7df] hover:border-[#FF9B55] hover:bg-[#FF9B55] hover:text-black"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selected}
                        onChange={() => setSelectedMethod(method.id)}
                        className="sr-only"
                      />
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${method.iconClass}`}>
                        {method.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-dark">{method.name}</span>
                        <span className="mt-1 block text-xs leading-5 text-light">{method.description}</span>
                      </span>
                      {selected && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {isCashOnDelivery ? (
                <div className="mt-6 rounded-2xl border border-primary/20 bg-secondary p-4 text-sm leading-6 text-light">
                  Continue to the separate delivery details form. You can pay the courier when your pet arrives.
                </div>
              ) : (
                <>
                  <div className="mt-6 rounded-2xl border border-primary/20 bg-secondary p-4 text-sm leading-6 text-light">
                    Complete payment using the official PetHouse {paymentMethods.find((method) => method.id === selectedMethod)?.name} account details provided by the shelter. Enter the transaction ID shown on your payment receipt below.
                  </div>
                  <label htmlFor="payment-phone" className="mb-2 mt-5 block text-sm font-semibold text-dark">
                    Mobile banking number
                  </label>
                  <div className="relative">
                    <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-light" />
                    <input
                      id="payment-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="input-field pl-11"
                    />
                  </div>
                  <label htmlFor="payment-transaction-id" className="mb-2 mt-4 block text-sm font-semibold text-dark">
                    Transaction ID
                  </label>
                  <input
                    id="payment-transaction-id"
                    type="text"
                    required
                    maxLength={100}
                    value={transactionId}
                    onChange={(event) => setTransactionId(event.target.value)}
                    placeholder="Enter the transaction ID from your receipt"
                    className="input-field"
                  />
                </>
              )}

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-secondary p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-xs leading-5 text-light">
                  <span className="font-semibold text-dark">Payment safety:</span> never share your wallet PIN or OTP.
                  Online payment details remain pending until verified.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !canContinue}
                className="btn-primary mt-6 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting order..."
                  : isCashOnDelivery
                    ? "Continue to delivery details"
                    : "Submit payment for verification"}
                {!isCashOnDelivery && <LockKeyhole className="h-4 w-4" />}
              </button>
            </section>

            <aside className="overflow-hidden rounded-3xl border border-[#ebe7df] bg-white shadow-sm">
              <div className="border-b border-[#eee9e1] px-5 py-4 sm:px-6">
                <h2 className="font-heading text-lg font-bold text-dark">Order summary</h2>
                <p className="mt-1 text-xs text-light">Adoption and delivery costs</p>
              </div>
              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-4">
                  {pet.image ? (
                    <Image
                      src={pet.image}
                      alt={pet.name}
                      width={80}
                      height={80}
                      unoptimized
                      className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <PawPrint className="h-8 w-8" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate font-heading text-lg font-bold text-dark">{pet.name}</h3>
                    <p className="mt-1 text-sm capitalize text-light">{pet.species} • {pet.breed || "Mixed"}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-light">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {pet.location}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-dashed border-[#e5e0d7] pt-4 text-sm">
                  <div className="flex justify-between gap-4 text-light">
                    <span>Adoption fee</span>
                    <span className="font-semibold text-dark">
                      {isFreeAdoptionFee ? "Free" : formatTaka(roundedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-light">
                    <span>Delivery fee</span>
                    <span className="font-semibold text-dark">{formatTaka(DELIVERY_FEE)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-light">
                    <span>Platform fee</span>
                    <span className="font-semibold text-dark">{formatTaka(PLATFORM_FEE)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-[#eee9e1] pt-4 text-base font-bold text-dark">
                    <span>Total</span>
                    <span className="text-primary">{formatTaka(totalAmount)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-light">
                  <LockKeyhole className="h-3.5 w-3.5 text-primary" />
                  Online payment submissions remain pending until verified.
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
