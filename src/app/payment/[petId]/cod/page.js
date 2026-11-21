"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, MapPin, PawPrint, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { DELIVERY_FEE, PLATFORM_FEE } from "@/lib/payments/fees";

function formatTaka(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

const initialDeliveryInfo = {
  fullName: "",
  mobileNumber: "",
  email: "",
  fullAddress: "",
  division: "",
  district: "",
  area: "",
  postalCode: "",
  alternativeContactNumber: "",
  deliveryInstructions: "",
};

export default function CashOnDeliveryPage() {
  const { petId } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(initialDeliveryInfo);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(`/payment/${petId}/cod`)}`);
      return;
    }

    let active = true;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`/api/pets/${petId}?optimized=1`),
      fetch("/api/user/profile", { headers }),
    ])
      .then(async ([petResponse, userResponse]) => {
        const petData = await petResponse.json();
        if (!petResponse.ok) throw new Error(petData.error || "Could not load this pet.");
        const userData = await userResponse.json();
        if (!userResponse.ok) throw new Error(userData.error || "Could not load your account.");
        if (userData.role !== "user") throw new Error("Only adopter accounts can place an order.");
        if (petData.status !== "approved") throw new Error("This pet is no longer available for adoption.");

        if (active) {
          setPet(petData);
          setDeliveryInfo((current) => ({
            ...current,
            fullName: userData.name || "",
            mobileNumber: userData.phone || "",
            email: userData.email || "",
          }));
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error.message || "Unable to load delivery checkout.");
          toast.error(error.message || "Unable to load delivery checkout.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [petId, router]);

  const updateDeliveryInfo = (event) => {
    const { name, value } = event.target;
    setDeliveryInfo((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!pet) return;

    const token = localStorage.getItem("token");
    if (!token) {
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
          paymentMethod: "cash_on_delivery",
          deliveryInfo,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to place your order.");
      if (!data.orderId) throw new Error("The order could not be confirmed.");

      router.push(`/payment/confirmation/${data.orderId}`);
    } catch (error) {
      toast.error(error.message || "Unable to place your order.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-secondary px-4 text-light">
        Loading delivery checkout...
      </main>
    );
  }

  if (errorMessage || !pet) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-secondary px-4 text-center">
        <p className="text-light">{errorMessage || "Unable to load delivery checkout."}</p>
        <Link href="/pets" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to adoptable pets
        </Link>
      </main>
    );
  }

  const adoptionFee = Number(pet.price) || 0;
  const totalAmount = adoptionFee + DELIVERY_FEE + PLATFORM_FEE;

  return (
    <main className="min-h-screen bg-secondary px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/payment/${pet._id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-light transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to payment methods
        </Link>

        <div className="mb-7">
          <p className="section-kicker mb-2">Cash on delivery</p>
          <h1 className="section-heading !text-3xl sm:!text-4xl">Where should we deliver {pet.name}?</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-light">
            Add your delivery details. Payment is collected when your pet arrives.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]"
        >
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#ebe7df] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0e8] text-primary">
                  <PawPrint className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-dark">Customer information</h2>
                  <p className="text-sm text-light">Your contact details for this order.</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-dark sm:col-span-2">
                  Full name <span className="text-primary">*</span>
                  <input
                    name="fullName"
                    value={deliveryInfo.fullName}
                    onChange={updateDeliveryInfo}
                    required
                    maxLength={100}
                    autoComplete="name"
                    className="input-field mt-2"
                  />
                </label>
                <label className="text-sm font-semibold text-dark">
                  Mobile number <span className="text-primary">*</span>
                  <input
                    name="mobileNumber"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={deliveryInfo.mobileNumber}
                    onChange={updateDeliveryInfo}
                    required
                    placeholder="01XXXXXXXXX"
                    className="input-field mt-2"
                  />
                </label>
                <label className="text-sm font-semibold text-dark">
                  Email address <span className="font-normal text-light">(optional)</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={deliveryInfo.email}
                    onChange={updateDeliveryInfo}
                    maxLength={254}
                    className="input-field mt-2"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-[#ebe7df] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0e8] text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-dark">Delivery address</h2>
                  <p className="text-sm text-light">Tell us where your pet should be delivered.</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-dark sm:col-span-2">
                  Full address <span className="text-primary">*</span>
                  <textarea
                    name="fullAddress"
                    value={deliveryInfo.fullAddress}
                    onChange={updateDeliveryInfo}
                    required
                    maxLength={1000}
                    rows={3}
                    autoComplete="street-address"
                    className="input-field mt-2 resize-y"
                  />
                </label>
                <label className="text-sm font-semibold text-dark">
                  Division <span className="text-primary">*</span>
                  <input
                    name="division"
                    value={deliveryInfo.division}
                    onChange={updateDeliveryInfo}
                    required
                    maxLength={100}
                    autoComplete="address-level1"
                    className="input-field mt-2"
                  />
                </label>
                <label className="text-sm font-semibold text-dark">
                  District <span className="text-primary">*</span>
                  <input
                    name="district"
                    value={deliveryInfo.district}
                    onChange={updateDeliveryInfo}
                    required
                    maxLength={100}
                    autoComplete="address-level2"
                    className="input-field mt-2"
                  />
                </label>
                <label className="text-sm font-semibold text-dark">
                  Area / City / Upazila <span className="text-primary">*</span>
                  <input
                    name="area"
                    value={deliveryInfo.area}
                    onChange={updateDeliveryInfo}
                    required
                    maxLength={100}
                    className="input-field mt-2"
                  />
                </label>
                <label className="text-sm font-semibold text-dark">
                  Postal code <span className="font-normal text-light">(optional)</span>
                  <input
                    name="postalCode"
                    value={deliveryInfo.postalCode}
                    onChange={updateDeliveryInfo}
                    maxLength={20}
                    autoComplete="postal-code"
                    className="input-field mt-2"
                  />
                </label>
                <label className="text-sm font-semibold text-dark">
                  Alternative contact number <span className="font-normal text-light">(optional)</span>
                  <input
                    name="alternativeContactNumber"
                    type="tel"
                    inputMode="tel"
                    value={deliveryInfo.alternativeContactNumber}
                    onChange={updateDeliveryInfo}
                    placeholder="01XXXXXXXXX"
                    className="input-field mt-2"
                  />
                </label>
                <label className="text-sm font-semibold text-dark sm:col-span-2">
                  Delivery instructions <span className="font-normal text-light">(optional)</span>
                  <textarea
                    name="deliveryInstructions"
                    value={deliveryInfo.deliveryInstructions}
                    onChange={updateDeliveryInfo}
                    maxLength={1000}
                    rows={3}
                    placeholder="Anything our delivery team should know?"
                    className="input-field mt-2 resize-y"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="overflow-hidden rounded-3xl border border-[#ebe7df] bg-white shadow-sm">
            <div className="border-b border-[#eee9e1] px-5 py-4 sm:px-6">
              <h2 className="font-heading text-lg font-bold text-dark">Order summary</h2>
              <p className="mt-1 text-xs text-light">Cash is collected upon delivery.</p>
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
                  <span className="font-semibold text-dark">{adoptionFee > 0 ? formatTaka(adoptionFee) : "Free"}</span>
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
                  <span>Total payable</span>
                  <span className="text-primary">{formatTaka(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-2xl bg-secondary p-4 text-xs leading-5 text-light">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Payment is pending and will be collected by the courier when your pet is delivered.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary mt-5 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Placing your order..." : "Confirm Order"}
                <LockKeyhole className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
