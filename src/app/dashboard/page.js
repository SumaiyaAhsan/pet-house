"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PawPrint, PlusCircle, Edit, Clock, MapPin, ArrowUpRight, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import ScrollReveal from "@/components/ScrollReveal";

function formatTaka(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function getOrderStatus(order) {
  return order.orderStatus || (order.status === "completed" ? "completed" : order.status);
}

function cacheOrderForDetails(order) {
  try {
    sessionStorage.setItem(`pet-house-order-${order._id}`, JSON.stringify(order));
    window.dispatchEvent(new Event("pet-house:order-cache"));
  } catch (cacheError) {
    console.warn("Could not cache order details for navigation:", cacheError);
  }
}

function getCachedUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

async function fetchJson(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The server is taking too long to respond. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [shelterOrders, setShelterOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?next=%2Fdashboard");
      return;
    }

    const redirectToLogin = (message) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error(message);
      router.replace("/login?next=%2Fdashboard");
    };

    const loadDashboard = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const cachedUser = getCachedUser();
      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false);
      }

      try {
        if (cachedUser?.role === "user") {
          const adoptionsResult = await fetchJson("/api/user/adoptions", { headers });
          if (adoptionsResult.response.status === 401) {
            redirectToLogin(adoptionsResult.data.error || "Your session has expired. Please sign in again.");
            return;
          }
          if (!adoptionsResult.response.ok) {
            throw new Error(adoptionsResult.data.error || "Unable to load your order history.");
          }
          if (!Array.isArray(adoptionsResult.data)) {
            throw new Error("Your order history is unavailable.");
          }
          setAdoptions(adoptionsResult.data);
        } else if (cachedUser?.role === "shelter") {
          setUser(cachedUser);
          setLoading(false);

          const profilePromise = fetchJson("/api/user/profile", { headers });
          const [profileResult, petsResult, ordersResult] = await Promise.all([
            profilePromise,
            fetchJson("/api/shelter/pets", { headers }),
            fetchJson("/api/shelter/orders", { headers }),
          ]);

          if ([profileResult, petsResult, ordersResult].some(({ response }) => response.status === 401)) {
            const unauthorized = [profileResult, petsResult, ordersResult].find(
              ({ response }) => response.status === 401
            );
            redirectToLogin(unauthorized.data.error || "Your session has expired. Please sign in again.");
            return;
          }
          if (profileResult.response.ok) setUser(profileResult.data);
          if (!petsResult.response.ok) throw new Error(petsResult.data.error || "Unable to load your pet listings.");
          if (!ordersResult.response.ok) throw new Error(ordersResult.data.error || "Unable to load your orders.");
          if (!Array.isArray(petsResult.data) || !Array.isArray(ordersResult.data)) {
            throw new Error("Shelter dashboard data is unavailable.");
          }
          setPets(petsResult.data);
          setShelterOrders(ordersResult.data);
        } else {
          const { response: profileResponse, data: profileData } = await fetchJson(
            "/api/user/profile",
            { headers }
          );
          if (profileResponse.status === 401) {
            redirectToLogin(profileData.error || "Your session has expired. Please sign in again.");
            return;
          }
          if (!profileResponse.ok) throw new Error(profileData.error || "Unable to load your profile.");
          setUser(profileData);

          if (profileData.role === "shelter") {
            const [petsResult, ordersResult] = await Promise.all([
              fetchJson("/api/shelter/pets", { headers }),
              fetchJson("/api/shelter/orders", { headers }),
            ]);
            if (petsResult.response.status === 401 || ordersResult.response.status === 401) {
              redirectToLogin("Your session has expired. Please sign in again.");
              return;
            }
            if (!petsResult.response.ok) throw new Error(petsResult.data.error || "Unable to load your pet listings.");
            if (!ordersResult.response.ok) throw new Error(ordersResult.data.error || "Unable to load your orders.");
            setPets(petsResult.data);
            setShelterOrders(ordersResult.data);
          } else if (profileData.role === "user") {
            const adoptionsResult = await fetchJson("/api/user/adoptions", { headers });
            if (adoptionsResult.response.status === 401) {
              redirectToLogin(adoptionsResult.data.error || "Your session has expired. Please sign in again.");
              return;
            }
            if (!adoptionsResult.response.ok) {
              throw new Error(adoptionsResult.data.error || "Unable to load your order history.");
            }
            setAdoptions(adoptionsResult.data);
          }
        }
      } catch (requestError) {
        console.error("Dashboard error:", requestError);
        setError(requestError.message || "Unable to load your dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-light">Loading Dashboard...</div>;
  }
  if (!user) return null;

  const myPets = adoptions.filter((order) => ["confirmed", "completed"].includes(getOrderStatus(order)));
  const pendingOrders = adoptions.filter((order) => getOrderStatus(order) === "pending");

  return (
    <div className="min-h-screen bg-secondary px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal as="header" className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-dark">
              Welcome, <span className="text-primary">{user.name}</span>
            </h1>
            <p className="capitalize text-light">{user.role} Account</p>
          </div>
          {user.role === "shelter" && (
            <Link href="/shelter/add-pet" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> Add New Pet
            </Link>
          )}
        </ScrollReveal>

        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {user.role === "shelter" && (
          <>
            <section className="mb-10">
              <h2 className="mb-4 font-heading text-2xl font-bold text-dark">My Pet Listings</h2>
              {pets.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-light">You haven&apos;t listed any pets yet.</p>
              ) : (
                <div className="space-y-5">
                  {pets.map((pet) => (
                    <article key={pet._id} className="card grid gap-4 p-3 lg:grid-cols-[minmax(230px,0.85fr)_minmax(300px,1.35fr)_minmax(250px,0.9fr)]">
                      <div className="flex flex-col rounded-[1.35rem] bg-[#f7f6f4] p-5 sm:p-6">
                        <p className="section-kicker mb-3">{pet.species} companion</p>
                        <h3 className="font-heading text-2xl font-bold text-dark">{pet.name}</h3>
                        <p className="mt-2 text-sm font-medium capitalize text-light">
                          {pet.species} <span className="mx-1">·</span> {pet.breed || "Mixed breed"}
                        </p>
                        <div className="mt-6">
                          <h4 className="font-heading text-base font-bold text-dark">About {pet.name}</h4>
                          <p className="mt-2 line-clamp-5 text-sm leading-6 text-light">
                            {pet.description || `Meet ${pet.name}, a lovely ${pet.species?.toLowerCase()} looking for a caring home.`}
                          </p>
                        </div>
                        <div className="mt-auto space-y-3 border-t border-[#e8e4de] pt-5">
                          <p className="flex items-start gap-2 text-sm text-light">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{pet.location || "Location not provided"}</span>
                          </p>
                          <p className="text-xs text-light">
                            Listed {new Date(pet.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="relative min-h-[280px] overflow-hidden rounded-[1.35rem] bg-[#f0ede7] lg:min-h-[320px]">
                        {pet.image ? (
                          <Image
                            src={pet.image}
                            alt={pet.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 45vw"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[280px] items-center justify-center text-primary">
                            <PawPrint className="h-16 w-16" />
                          </div>
                        )}
                        <span className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                          pet.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                          pet.status === "pending" ? "bg-amber-100 text-amber-800" :
                          pet.status === "reserved" ? "bg-orange-100 text-orange-800" :
                          pet.status === "adopted" ? "bg-indigo-100 text-indigo-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {pet.status}
                        </span>
                      </div>

                      <div className="flex flex-col rounded-[1.35rem] bg-[#f7f6f4] p-5 sm:p-6">
                        <p className="text-sm font-semibold text-light">Adoption fee</p>
                        <p className="mt-1 font-heading text-3xl font-bold tracking-[-0.06em] text-dark">
                          {formatTaka(pet.price)}
                        </p>
                        <div className="mt-5 rounded-2xl bg-white p-4">
                          <h4 className="mb-4 font-heading text-sm font-bold text-dark">Pet details</h4>
                          <dl className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
                            <div>
                              <dt className="text-xs text-light">Age</dt>
                              <dd className="mt-1 font-semibold text-dark">{pet.age} {Number(pet.age) === 1 ? "year" : "years"}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-light">Gender</dt>
                              <dd className="mt-1 font-semibold text-dark">{pet.gender || "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-light">Breed</dt>
                              <dd className="mt-1 truncate font-semibold text-dark">{pet.breed || "Mixed"}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-light">Status</dt>
                              <dd className="mt-1 capitalize font-semibold text-dark">{pet.status}</dd>
                            </div>
                          </dl>
                        </div>
                        <div className="mt-auto flex flex-col gap-2 pt-5">
                          {pet.status === "approved" && (
                            <Link href={`/pets/${pet._id}`} className="btn-secondary flex w-full items-center justify-center gap-2 px-3 py-3 text-sm">
                              <ArrowUpRight className="h-4 w-4" /> View listing
                            </Link>
                          )}
                          {!["reserved", "adopted"].includes(pet.status) && (
                            <Link href={`/shelter/edit-pet/${pet._id}`} className="btn-primary flex w-full items-center justify-center gap-2 px-3 py-3 text-sm">
                              <Edit className="h-4 w-4" /> Edit
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-bold text-dark">Orders for My Pets</h2>
              {shelterOrders.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-light">Orders for your listings will appear here.</div>
              ) : (
                <div className="space-y-3">
                  {shelterOrders.map((order) => (
                    <article key={order._id} className="rounded-2xl bg-white p-5 shadow-sm">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="font-heading text-lg font-bold text-dark">{order.petName}</h3>
                          <p className="mt-1 text-sm text-light">
                            Ordered by {order.adopterName} · {order.paymentMethod?.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 text-xs text-light">
                            Order {order._id} · {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold capitalize">
                          <span className="rounded-full bg-secondary px-3 py-1.5 text-dark">Order: {getOrderStatus(order)}</span>
                          <span className="rounded-full bg-secondary px-3 py-1.5 text-dark">Payment: {order.status}</span>
                        </div>
                      </div>
                      {order.deliveryInfo && (
                        <div className="mt-4 border-t border-[#eee9e1] pt-3 text-sm text-light">
                          <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>
                              {order.deliveryInfo.mobileNumber} · {order.deliveryInfo.area}, {order.deliveryInfo.district},{" "}
                              {order.deliveryInfo.division}
                            </span>
                          </p>
                        </div>
                      )}
                      {order.buyer?._id && order.pet?._id && (
                        <div className="mt-4 border-t border-[#eee9e1] pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/messages?pet=${order.pet._id}&to=${order.buyer._id}`)
                            }
                            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                          >
                            <MessageCircle className="h-4 w-4" /> Message Adopter
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {user.role === "user" && (
          <>
            {pendingOrders.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 font-heading text-2xl font-bold text-dark">Pending Orders</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingOrders.map((order, index) => (
                    <ScrollReveal
                      as="article"
                      key={order._id}
                      delay={Math.min(index, 3) * 90}
                      className="flex items-center gap-4 rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ffbd8a] hover:bg-[#fffaf5] hover:shadow-md"
                    >
                      {order.pet?.image ? (
                        <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                          <Image src={order.pet.image} alt={order.pet.name || order.petName} fill sizes="80px" unoptimized className="object-cover" />
                        </span>
                      ) : (
                        <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary text-primary">
                          <PawPrint />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-dark">{order.pet?.name || order.petName || "Pet"}</h3>
                        <p className="text-xs capitalize text-light">{order.paymentMethod?.replaceAll("_", " ")}</p>
                        <p className="mt-1 text-sm font-semibold text-dark">Payment: {order.status}</p>
                        <Link
                          href={`/payment/confirmation/${order._id}`}
                          onClick={() => cacheOrderForDetails(order)}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-[#b94b00] hover:underline"
                        >
                          View Order <Clock className="h-4 w-4" />
                        </Link>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            )}

            <section>
              <ScrollReveal className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-dark">My Pets</h2>
                  <p className="mt-1 text-sm text-light">Confirmed adoptions and their order history.</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-dark">{myPets.length} pets</span>
              </ScrollReveal>

              {myPets.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <PawPrint className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <h3 className="mb-2 text-xl font-bold text-dark">No confirmed adoptions yet</h3>
                  <p className="mb-4 text-light">
                    Confirmed pets will appear here automatically. Browse available pets to find your new best friend.
                  </p>
                  <Link href="/pets" className="btn-primary">Browse Pets</Link>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {myPets.map((order, index) => {
                    const pet = order.pet;
                    const petName = pet?.name || order.petName || "Pet";
                    return (
                      <ScrollReveal
                        as="article"
                        key={order._id}
                        delay={Math.min(index, 3) * 90}
                        className="overflow-hidden rounded-2xl border-2 border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ffbd8a] hover:bg-[#fffaf5] hover:shadow-lg"
                      >
                        {pet?.image ? (
                          <div className="relative h-52 w-full">
                            <Image src={pet.image} alt={petName} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-52 items-center justify-center bg-[#f0ede7] text-primary">
                            <PawPrint className="h-14 w-14" />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-heading text-xl font-bold text-dark">{petName}</h3>
                              <p className="mt-1 text-sm text-light">
                                {[pet?.species, pet?.breed].filter(Boolean).join(" · ") || "Pet"}
                              </p>
                            </div>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">
                              {getOrderStatus(order)}
                            </span>
                          </div>

                          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-[#eee9e1] pt-4 text-xs">
                            <div><dt className="text-light">Age</dt><dd className="mt-1 font-semibold text-dark">{pet?.age ?? "—"}</dd></div>
                            <div><dt className="text-light">Gender</dt><dd className="mt-1 font-semibold text-dark">{pet?.gender || "—"}</dd></div>
                            <div><dt className="text-light">Adopted on</dt><dd className="mt-1 font-semibold text-dark">{new Date(order.confirmedAt || order.createdAt).toLocaleDateString()}</dd></div>
                            <div><dt className="text-light">Order ID</dt><dd className="mt-1 truncate font-mono font-semibold text-dark">{order._id}</dd></div>
                            <div><dt className="text-light">Payment method</dt><dd className="mt-1 capitalize font-semibold text-dark">{order.paymentMethod?.replaceAll("_", " ") || order.gateway}</dd></div>
                            <div><dt className="text-light">Payment status</dt><dd className="mt-1 capitalize font-semibold text-dark">{order.status}</dd></div>
                          </dl>

                          <div className="mt-4 flex items-center justify-between border-t border-[#eee9e1] pt-4">
                            <span className="font-bold text-dark">Adoption price {formatTaka(order.adoptionFee ?? pet?.price)}</span>
                            <Link
                              href={`/payment/confirmation/${order._id}`}
                              onClick={() => cacheOrderForDetails(order)}
                              className="text-sm font-bold text-primary transition-colors hover:text-[#b94b00] hover:underline"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
