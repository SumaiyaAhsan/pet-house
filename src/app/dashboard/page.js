"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PawPrint, PlusCircle, Edit, Clock, MapPin } from "lucide-react";

function formatTaka(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function getOrderStatus(order) {
  return order.orderStatus || (order.status === "completed" ? "completed" : order.status);
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
      router.push("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const profileResponse = await fetch("/api/user/profile", { headers });
        const userData = await profileResponse.json();
        if (!profileResponse.ok) throw new Error(userData.error || "Unable to load your profile.");
        setUser(userData);

        if (userData.role === "shelter") {
          const [petsResponse, ordersResponse] = await Promise.all([
            fetch("/api/shelter/pets", { headers }),
            fetch("/api/shelter/orders", { headers }),
          ]);
          const [petsData, ordersData] = await Promise.all([
            petsResponse.json(),
            ordersResponse.json(),
          ]);
          if (!petsResponse.ok) throw new Error(petsData.error || "Unable to load your pet listings.");
          if (!ordersResponse.ok) throw new Error(ordersData.error || "Unable to load your orders.");
          if (!Array.isArray(petsData) || !Array.isArray(ordersData)) {
            throw new Error("Shelter dashboard data is unavailable.");
          }
          setPets(petsData);
          setShelterOrders(ordersData);
        } else if (userData.role === "user") {
          const response = await fetch("/api/user/adoptions", { headers });
          const adoptionsData = await response.json();
          if (!response.ok) throw new Error(adoptionsData.error || "Unable to load your order history.");
          if (!Array.isArray(adoptionsData)) throw new Error("Your order history is unavailable.");
          setAdoptions(adoptionsData);
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
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-dark">Welcome, {user.name}</h1>
            <p className="capitalize text-light">{user.role} Account</p>
          </div>
          {user.role === "shelter" && (
            <Link href="/shelter/add-pet" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> Add New Pet
            </Link>
          )}
        </header>

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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pets.map((pet) => (
                    <article key={pet._id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                      {pet.image ? (
                        <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                          <Image src={pet.image} alt={pet.name} fill sizes="80px" unoptimized className="object-cover" />
                        </span>
                      ) : (
                        <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary text-primary">
                          <PawPrint />
                        </span>
                      )}
                      <div className="min-w-0 flex-grow">
                        <h3 className="truncate text-lg font-bold text-dark">{pet.name}</h3>
                        <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                          pet.status === "approved" ? "bg-green-100 text-green-700" :
                          pet.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          pet.status === "reserved" ? "bg-orange-100 text-orange-700" :
                          pet.status === "adopted" ? "bg-indigo-100 text-indigo-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {pet.status.toUpperCase()}
                        </span>
                        {!["reserved", "adopted"].includes(pet.status) && (
                          <Link href={`/shelter/edit-pet/${pet._id}`} className="mt-2 flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                            <Edit className="h-4 w-4" /> Edit Details
                          </Link>
                        )}
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
                  {pendingOrders.map((order) => (
                    <article key={order._id} className="flex items-center gap-4 rounded-2xl border-2 border-orange-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md">
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
                        <Link href={`/payment/confirmation/${order._id}`} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                          View Order <Clock className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-dark">My Pets</h2>
                  <p className="mt-1 text-sm text-light">Confirmed adoptions and their order history.</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-dark">{myPets.length} pets</span>
              </div>

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
                  {myPets.map((order) => {
                    const pet = order.pet;
                    const petName = pet?.name || order.petName || "Pet";
                    return (
                      <article key={order._id} className="overflow-hidden rounded-2xl border-2 border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
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
                            <Link href={`/payment/confirmation/${order._id}`} className="text-sm font-bold text-primary hover:underline">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </article>
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
