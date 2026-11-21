"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Check,
  CheckCircle,
  PawPrint,
  X,
  XCircle,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-emerald-100 text-emerald-800",
    reserved: "bg-orange-100 text-orange-800",
    adopted: "bg-indigo-100 text-indigo-800",
    pending: "bg-orange-100 text-orange-800",
    rejected: "bg-red-100 text-red-800",
  };
  const label = status || "pending";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[label] || "bg-gray-100 text-gray-700"}`}
    >
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [pets, setPets] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePetId, setActivePetId] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [reload, setReload] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "admin") {
      toast.error("Access denied. Admins only.");
      router.replace("/login");
      return;
    }

    const controller = new AbortController();

    const fetchDashboard = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [petsResponse, overviewResponse] = await Promise.all([
          fetch("/api/admin/pets", { headers, signal: controller.signal }),
          fetch("/api/admin/overview", { headers, signal: controller.signal }),
        ]);
        const [petsData, overviewData] = await Promise.all([
          petsResponse.json(),
          overviewResponse.json(),
        ]);

        if (!petsResponse.ok) throw new Error(petsData.error || "Failed to load pet listings");
        if (!overviewResponse.ok) throw new Error(overviewData.error || "Failed to load platform overview");
        if (!Array.isArray(petsData) || !overviewData.stats) {
          throw new Error("Platform information is unavailable");
        }

        setPets(petsData);
        setOverview(overviewData);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error(requestError);
          setError("We couldn't load the pet listings. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => controller.abort();
  }, [reload, router]);

  const handleAction = async (petId, status) => {
    const token = localStorage.getItem("token");
    setActivePetId(petId);

    try {
      const response = await fetch("/api/admin/pets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ petId, status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update this listing");
      }

      toast.success(`Pet ${status} successfully`);
      setLoading(true);
      setReload((value) => value + 1);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setActivePetId(null);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    const token = localStorage.getItem("token");
    setActiveOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update this order");

      toast.success(
        action === "confirm"
          ? "Payment verified and order confirmed."
          : action === "complete"
            ? "Order marked complete."
            : "Order cancelled and pet released."
      );
      setLoading(true);
      setReload((value) => value + 1);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setActiveOrderId(null);
    }
  };

  const pendingPet = pets.find((pet) => pet.status === "pending");
  const approvedCount = pets.filter((pet) => pet.status === "approved").length;
  const adoptedCount = pets.filter((pet) => pet.status === "adopted").length;
  const reservedCount = pets.filter((pet) => pet.status === "reserved").length;

  return (
    <div className="min-h-screen bg-secondary lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <AdminSidebar active="dashboard" />

      <div id="overview" className="min-w-0 px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-7">
            <p className="section-kicker mb-2">Overview</p>
            <h1 className="section-heading !text-3xl sm:!text-4xl">Admin dashboard</h1>
            <p className="mt-2 text-sm text-light">
              Review pet listings and keep the adoption marketplace up to date.
            </p>
          </header>

          {loading ? (
            <div className="space-y-5" aria-label="Loading admin dashboard">
              <div className="h-28 animate-pulse rounded-3xl bg-white/70" />
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/70" />
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/70" />
                ))}
              </div>
            </div>
          ) : error ? (
            <section className="rounded-3xl border border-[#ebe7df] bg-white p-8 text-center">
              <PawPrint className="mx-auto mb-3 h-9 w-9 text-primary" />
              <h2 className="font-heading text-xl font-bold text-dark">Dashboard unavailable</h2>
              <p className="mt-2 text-sm text-light">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setReload((value) => value + 1);
                }}
                className="btn-primary mt-5"
              >
                Try again
              </button>
            </section>
          ) : (
            <>
              {pendingPet ? (
                <section className="mb-5 flex flex-col gap-5 rounded-3xl bg-dark p-5 text-white sm:flex-row sm:items-center sm:px-7 sm:py-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-dark">
                    {pendingPet.name?.charAt(0)?.toUpperCase() || <PawPrint className="h-6 w-6" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                      Needs your review
                    </p>
                    <h2 className="mt-1 truncate font-heading text-2xl font-bold">
                      {pendingPet.name}
                    </h2>
                    <p className="text-sm text-white/65">
                      {pendingPet.species} {pendingPet.breed ? `· ${pendingPet.breed}` : ""}
                      {pendingPet.listedBy?.name ? ` · Submitted by ${pendingPet.listedBy.name}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction(pendingPet._id, "approved")}
                      disabled={activePetId === pendingPet._id}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-dark transition-colors hover:bg-primary-hover disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(pendingPet._id, "rejected")}
                      disabled={activePetId === pendingPet._id}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </section>
              ) : (
                <section className="mb-5 flex items-center gap-4 rounded-3xl bg-dark p-5 text-white sm:px-7 sm:py-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-dark">
                    <CheckCircle className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="font-heading text-xl font-bold">You&apos;re all caught up</p>
                    <p className="mt-1 text-sm text-white/65">There are no pet listings waiting for review.</p>
                  </div>
                </section>
              )}

              <section aria-label="Platform statistics" className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Total users", value: overview.stats.totalUsers, color: "text-dark" },
                  { label: "Adopters", value: overview.stats.totalAdopters, color: "text-dark" },
                  { label: "Shelters", value: overview.stats.totalShelters, color: "text-dark" },
                  { label: "Total pets", value: overview.stats.totalPets, color: "text-dark" },
                  { label: "Available pets", value: overview.stats.totalAvailablePets, color: "text-emerald-700" },
                  { label: "Reserved pets", value: overview.stats.totalReservedPets, color: "text-orange-700" },
                  { label: "Adopted pets", value: overview.stats.totalAdoptedPets, color: "text-indigo-700" },
                  { label: "Confirmed orders", value: overview.stats.totalConfirmedOrders, color: "text-dark" },
                  { label: "Completed orders", value: overview.stats.totalCompletedOrders, color: "text-emerald-700" },
                  { label: "Pending orders", value: overview.stats.totalPendingOrders, color: "text-orange-700" },
                  { label: "Cancelled orders", value: overview.stats.totalCancelledOrders, color: "text-red-700" },
                  {
                    label: "Total revenue",
                    value: `৳${Number(overview.stats.totalRevenue).toLocaleString("en-BD")}`,
                    color: "text-dark",
                  },
                ].map((stat) => (
                  <article key={stat.label} className="rounded-2xl border border-[#ebe7df] bg-white px-5 py-4">
                    <p className="text-xs font-medium text-light">{stat.label}</p>
                    <p className={`mt-1 font-heading text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </article>
                ))}
              </section>

              <div className="mb-8 grid gap-5">
                <section className="overflow-hidden rounded-3xl border border-[#ebe7df] bg-white">
                  <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-5 sm:px-6">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-dark">Recent orders</h2>
                      <p className="mt-1 text-sm text-light">Order and payment status from the database.</p>
                    </div>
                    <p className="text-xs text-light">
                      Platform fees collected: ৳{Number(overview.stats.totalPlatformFeesCollected).toLocaleString("en-BD")}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-light">
                        <tr>
                          <th className="px-5 py-3">Order</th>
                          <th className="px-5 py-3">Adopter</th>
                          <th className="px-5 py-3">Pet</th>
                          <th className="px-5 py-3">Payment method</th>
                          <th className="px-5 py-3">Payment details</th>
                          <th className="px-5 py-3">Amount</th>
                          <th className="px-5 py-3">Payment / order</th>
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eee9e1]">
                        {overview.recentOrders.map((order) => {
                          const canVerify =
                            order.gateway === "manual" &&
                            order.status === "pending" &&
                            order.orderStatus === "pending";
                          const canComplete =
                            (order.gateway === "cash_on_delivery" &&
                              order.status === "pending" &&
                              order.orderStatus === "confirmed") ||
                            (order.status === "completed" && order.orderStatus === "confirmed");
                          const canCancel =
                            ["manual", "cash_on_delivery"].includes(order.gateway) &&
                            order.status === "pending";

                          return (
                            <tr key={order._id}>
                              <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-light">
                                {order._id.slice(-8)}
                              </td>
                              <td className="whitespace-nowrap px-5 py-3 font-medium text-dark">{order.adopterName}</td>
                              <td className="whitespace-nowrap px-5 py-3 text-dark">{order.petName}</td>
                              <td className="whitespace-nowrap px-5 py-3 capitalize text-light">
                                {(order.paymentMethod || "unknown").replaceAll("_", " ")}
                              </td>
                              <td className="px-5 py-3 text-xs text-light">
                                {order.gateway === "manual" ? (
                                  <>
                                    <p>{order.customerPhone || "No number"}</p>
                                    <p className="font-mono">Txn: {order.customerTransactionId || "—"}</p>
                                  </>
                                ) : "—"}
                              </td>
                              <td className="whitespace-nowrap px-5 py-3 font-semibold text-dark">
                                ৳{Number(order.amount || 0).toLocaleString("en-BD")}
                              </td>
                              <td className="whitespace-nowrap px-5 py-3 text-xs capitalize text-light">
                                {order.status} / {order.orderStatus}
                              </td>
                              <td className="whitespace-nowrap px-5 py-3 text-xs text-light">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="whitespace-nowrap px-5 py-3">
                                <div className="flex gap-2">
                                  {canVerify && (
                                    <button
                                      type="button"
                                      onClick={() => handleOrderAction(order._id, "confirm")}
                                      disabled={activeOrderId === order._id}
                                      className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                                    >
                                      Verify payment
                                    </button>
                                  )}
                                  {canComplete && (
                                    <button
                                      type="button"
                                      onClick={() => handleOrderAction(order._id, "complete")}
                                      disabled={activeOrderId === order._id}
                                      className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-50"
                                    >
                                      {order.gateway === "cash_on_delivery" ? "Mark delivered" : "Complete order"}
                                    </button>
                                  )}
                                  {canCancel && (
                                    <button
                                      type="button"
                                      onClick={() => handleOrderAction(order._id, "cancel")}
                                      disabled={activeOrderId === order._id}
                                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {overview.recentOrders.length === 0 && (
                          <tr><td colSpan="9" className="px-5 py-8 text-center text-sm text-light">No orders yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="grid gap-5 xl:grid-cols-2">
                  <section className="overflow-hidden rounded-3xl border border-[#ebe7df] bg-white">
                    <div className="px-5 py-5 sm:px-6">
                      <h2 className="font-heading text-xl font-bold text-dark">Recently added pets</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-light">
                          <tr>
                            <th className="px-5 py-3">Pet</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Shelter</th>
                            <th className="px-5 py-3">Price</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Listed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee9e1]">
                          {overview.recentPets.map((pet) => (
                            <tr key={pet._id}>
                              <td className="px-5 py-3 font-semibold text-dark">{pet.name}</td>
                              <td className="px-5 py-3 text-light">{pet.species}</td>
                              <td className="px-5 py-3 text-light">{pet.listedBy?.name || "Shelter"}</td>
                              <td className="whitespace-nowrap px-5 py-3 text-dark">৳{Number(pet.price || 0).toLocaleString("en-BD")}</td>
                              <td className="px-5 py-3 capitalize text-light">{pet.status}</td>
                              <td className="whitespace-nowrap px-5 py-3 text-xs text-light">{new Date(pet.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {overview.recentPets.length === 0 && (
                            <tr><td colSpan="6" className="px-5 py-8 text-center text-sm text-light">No pets listed yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-3xl border border-[#ebe7df] bg-white">
                    <div className="px-5 py-5 sm:px-6">
                      <h2 className="font-heading text-xl font-bold text-dark">Recently registered users</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-light">
                          <tr>
                            <th className="px-5 py-3">User</th>
                            <th className="px-5 py-3">Role</th>
                            <th className="px-5 py-3">Orders</th>
                            <th className="px-5 py-3">Confirmed</th>
                            <th className="px-5 py-3">Registered</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee9e1]">
                          {overview.recentUsers.map((registeredUser) => (
                            <tr key={registeredUser._id}>
                              <td className="px-5 py-3">
                                <p className="font-semibold text-dark">{registeredUser.name}</p>
                                <p className="text-xs text-light">{registeredUser.email}</p>
                              </td>
                              <td className="px-5 py-3 capitalize text-light">{registeredUser.role}</td>
                              <td className="px-5 py-3 text-dark">{registeredUser.totalOrders}</td>
                              <td className="px-5 py-3 text-dark">{registeredUser.confirmedOrders}</td>
                              <td className="whitespace-nowrap px-5 py-3 text-xs text-light">{new Date(registeredUser.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {overview.recentUsers.length === 0 && (
                            <tr><td colSpan="5" className="px-5 py-8 text-center text-sm text-light">No registered users yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </div>

              <section aria-label="Pet listing statistics" className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Total listings", value: pets.length, color: "text-dark" },
                  { label: "Approved", value: approvedCount, color: "text-emerald-700" },
                  { label: "Reserved", value: reservedCount, color: "text-orange-700" },
                  { label: "Adopted", value: adoptedCount, color: "text-indigo-700" },
                ].map((stat) => (
                  <article key={stat.label} className="rounded-2xl border border-[#ebe7df] bg-white px-5 py-4">
                    <p className="text-xs font-medium text-light">{stat.label}</p>
                    <p className={`mt-1 font-heading text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </article>
                ))}
              </section>

              <section id="listings" aria-labelledby="listings-heading">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <h2 id="listings-heading" className="font-heading text-2xl font-bold text-dark">
                    All listings
                  </h2>
                  <span className="text-sm text-light">{pets.length} total</span>
                </div>

                {pets.length === 0 ? (
                  <div className="rounded-2xl border border-[#ebe7df] bg-white px-6 py-12 text-center">
                    <PawPrint className="mx-auto mb-3 h-9 w-9 text-primary" />
                    <p className="font-semibold text-dark">No pet listings yet</p>
                    <p className="mt-1 text-sm text-light">New submissions will appear here for review.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {pets.map((pet) => (
                      <article
                        key={pet._id}
                        className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#ebe7df] bg-white p-4"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-heading text-lg font-bold text-primary">
                          {pet.name?.charAt(0)?.toUpperCase() || <PawPrint className="h-5 w-5" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold text-dark">{pet.name}</h3>
                          <p className="truncate text-xs capitalize text-light">
                            {pet.breed || pet.species || "Pet listing"}
                          </p>
                        </div>
                        {pet.status === "pending" && (
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() => handleAction(pet._id, "approved")}
                              disabled={activePetId === pet._id}
                              className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                              aria-label={`Approve ${pet.name}`}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(pet._id, "rejected")}
                              disabled={activePetId === pet._id}
                              className="rounded-lg bg-red-50 p-2 text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                              aria-label={`Reject ${pet.name}`}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <StatusBadge status={pet.status} />
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
