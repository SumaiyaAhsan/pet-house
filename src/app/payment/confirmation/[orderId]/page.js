"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Clock3, MapPin, PawPrint, Truck } from "lucide-react";

function formatTaka(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function clearCachedOrder(cacheKey) {
  try {
    sessionStorage.removeItem(cacheKey);
    window.dispatchEvent(new Event("pet-house:order-cache"));
  } catch (cacheError) {
    console.warn("Could not clear cached order details:", cacheError);
  }
}

function subscribeToOrderCache(callback) {
  window.addEventListener("pet-house:order-cache", callback);
  return () => window.removeEventListener("pet-house:order-cache", callback);
}

function getCachedOrderSnapshot(orderId) {
  try {
    const cachedOrder = JSON.parse(sessionStorage.getItem(`pet-house-order-${orderId}`) || "null");
    return cachedOrder?._id === orderId ? JSON.stringify(cachedOrder) : null;
  } catch (cacheError) {
    console.warn("Could not read cached order details:", cacheError);
    return null;
  }
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [refreshedOrder, setRefreshedOrder] = useState(null);
  const [error, setError] = useState("");
  const cachedOrderSnapshot = useSyncExternalStore(
    subscribeToOrderCache,
    () => getCachedOrderSnapshot(orderId),
    () => null
  );
  const cachedOrder = cachedOrderSnapshot ? JSON.parse(cachedOrderSnapshot) : null;
  const order = refreshedOrder || cachedOrder;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(`/payment/confirmation/${orderId}`)}`);
      return;
    }

    let active = true;
    const cacheKey = `pet-house-order-${orderId}`;
    fetch(`/api/payment/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load this order.");
        if (active) {
          setRefreshedOrder(data.order);
          clearCachedOrder(cacheKey);
        }
      })
      .catch((fetchError) => {
        if (active) setError(fetchError.message || "Unable to load this order.");
      });

    return () => {
      active = false;
    };
  }, [orderId, router]);

  if (error && !order) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-secondary px-4 text-center">
        <p className="text-light">{error}</p>
        <Link href="/pets" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to adoptable pets
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-secondary px-4 text-light">
        Loading order confirmation...
      </main>
    );
  }

  const isCod = order.gateway === "cash_on_delivery";
  const pet = order.pet;
  const adoptionFee = Number(order.adoptionFee ?? pet?.price) || 0;
  const paymentStatus = order.status === "completed" ? "Completed" : order.status;
  const orderStatus = order.orderStatus || order.status;

  return (
    <main className="min-h-screen bg-secondary px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-3xl border border-[#ebe7df] bg-white shadow-sm">
          <div className="bg-dark px-6 py-8 text-center text-white sm:px-10">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-dark">
              <Check className="h-7 w-7" />
            </span>
            <p className="section-kicker !text-white/75">Order received</p>
            <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Thank you for your order!</h1>
            <p className="mt-3 text-sm text-white/75">
              Order ID: <span className="font-semibold text-white">{order._id}</span>
            </p>
          </div>

          <div className="p-5 sm:p-8">
            {error && (
              <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                Showing saved order details. {error}
              </p>
            )}
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-secondary p-4">
              {isCod ? (
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              ) : (
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              )}
              <div>
                <p className="font-semibold text-dark">
                  Order status: <span className="capitalize">{orderStatus}</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-dark">
                  Payment status: <span className="capitalize">{paymentStatus}</span>
                </p>
                <p className="mt-1 text-sm leading-6 text-light">
                  {isCod
                    ? order.status === "completed"
                      ? "Payment has been collected and your order is complete."
                      : "Payment will be collected by the courier upon delivery."
                    : order.status === "completed"
                      ? "Your mobile-banking payment has been verified."
                      : "Your payment details are awaiting verification. Submitting a transaction ID does not confirm payment."}
                </p>
              </div>
            </div>

            {pet && (
              <div className="mb-6 flex items-center gap-4">
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
                <div>
                  <h2 className="font-heading text-lg font-bold text-dark">{pet.name}</h2>
                  <p className="text-sm capitalize text-light">{pet.species} • {pet.breed || "Mixed"}</p>
                  {order.deliveryInfo?.area && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-light">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {order.deliveryInfo.area}, {order.deliveryInfo.district}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3 border-t border-dashed border-[#e5e0d7] pt-4 text-sm">
              <div className="flex justify-between gap-4 text-light">
                <span>Adoption fee</span>
                <span className="font-semibold text-dark">{adoptionFee > 0 ? formatTaka(adoptionFee) : "Free"}</span>
              </div>
              <div className="flex justify-between gap-4 text-light">
                <span>Delivery fee</span>
                <span className="font-semibold text-dark">{formatTaka(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between gap-4 text-light">
                <span>Platform fee</span>
                <span className="font-semibold text-dark">{formatTaka(order.platformFee)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#eee9e1] pt-4 text-base font-bold text-dark">
                <span>Total payable</span>
                <span className="text-primary">{formatTaka(order.amount)}</span>
              </div>
            </div>

            {!isCod && (
              <p className="mt-5 text-sm text-light">
                {(order.paymentMethod || "Online payment").replaceAll("_", " ").toUpperCase()} transaction ID:{" "}
                <span className="font-semibold text-dark">{order.customerTransactionId}</span>
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="btn-secondary flex-1">
                View My Pets
              </Link>
              <Link href="/pets" className="btn-primary flex-1">
                Browse more pets
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
