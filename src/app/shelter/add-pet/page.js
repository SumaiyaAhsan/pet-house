"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, ArrowLeft, PawPrint, ImagePlus } from "lucide-react";
import Link from "next/link";

export default function AddPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "Male",
    description: "",
    healthInfo: "",
    image: "",
    location: "",
    price: 0,
  });

    // Handle Image Upload (Convert to Base64 locally)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
      toast.success("Image loaded successfully!");
      setUploading(false);
    };

    reader.onerror = () => {
      toast.error("Failed to read image");
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "shelter") {
      toast.error("You must be logged in as a Shelter to add a pet.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to add pet");

      toast.success("Pet added successfully! Waiting for admin approval.");
      router.push("/"); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-[calc(100vh-6rem)] bg-[#f7f3eb] px-4 py-8 pb-20 sm:px-6 sm:py-12"
      style={{
        backgroundImage:
          "linear-gradient(115deg, rgba(247, 243, 235, 0.28), rgba(247, 243, 235, 0.12)), url('/add%20pets_bg.jpg')",
        backgroundPosition: "center 67%",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto w-full max-w-[790px]">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/65 px-4 py-2.5 text-sm font-semibold text-light backdrop-blur-md transition-colors hover:border-[#FF9B55] hover:bg-[#FF9B55] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <section
          className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-2xl shadow-[#342b1d]/15 backdrop-blur-xl sm:p-8 lg:p-12"
          aria-labelledby="add-pet-heading"
        >
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex h-13 w-13 items-center justify-center rounded-full bg-[#fff0e8] text-primary">
              <PawPrint />
            </span>
            <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-primary-hover">
              Rehome a pet
            </p>
            <h1 id="add-pet-heading" className="font-heading text-3xl font-bold leading-tight tracking-[-0.06em] text-dark sm:text-4xl">
              Share a pet&apos;s story
            </h1>
            <p className="mx-auto mt-3 max-w-[33rem] text-sm leading-7 text-light">
            Add clear details and a photo so the right family can find this pet. Listings are reviewed before they go live.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Pet Photo</label>
              <div className="flex min-h-24 flex-wrap items-center gap-4 rounded-2xl border border-dashed border-primary/40 bg-[#fff8f3]/80 p-4 sm:flex-nowrap">
                {formData.image && (
                  <img src={formData.image} alt="Pet photo preview" className="h-18 w-18 shrink-0 rounded-xl border-2 border-white object-cover shadow-md" />
                )}
                {!formData.image && (
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff0e8] text-primary" aria-hidden="true">
                    <ImagePlus className="h-5 w-5" />
                  </span>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold text-dark">
                    {formData.image ? "Looking good!" : "Add a photo of your pet"}
                  </span>
                  <span className="text-xs leading-5 text-light">A clear photo helps them find their new family.</span>
                </div>
                <label                                                 className="relative inline-flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-[#e6ddd3] bg-white px-4 py-2 text-xs font-semibold text-dark transition-colors hover:border-[#FF9B55] hover:bg-[#FF9B55] hover:text-black sm:w-auto">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : formData.image ? "Change photo" : "Upload image"}
                  <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Pet Name</label>
                <input type="text" required className="input-field min-h-[3.15rem] bg-white/85 text-sm" placeholder="e.g. Buddy"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Species</label>
                <select required className="input-field min-h-[3.15rem] bg-white/85 text-sm" value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}>
                  <option value="">Select Species</option>
                  <option value="Dog">🐕 Dog</option>
                  <option value="Cat">🐈 Cat</option>
                  <option value="Bird">🦜 Bird</option>
                  <option value="Rabbit">🐇 Rabbit</option>
                  <option value="Fish">🐠 Fish</option>
                  <option value="Hamster">🐹 Hamster</option>
                  <option value="Turtle">🐢 Turtle</option>
                  <option value="Other">🐾 Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Breed (Optional)</label>
                <input type="text" className="input-field min-h-[3.15rem] bg-white/85 text-sm" placeholder="e.g. Golden Retriever"
                  value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Age (Years)</label>
                <input type="number" required min="0" step="0.5" className="input-field min-h-[3.15rem] bg-white/85 text-sm" placeholder="e.g. 2"
                  value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Gender</label>
                <select className="input-field min-h-[3.15rem] bg-white/85 text-sm" value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Location</label>
                <input type="text" required className="input-field min-h-[3.15rem] bg-white/85 text-sm" placeholder="e.g. Dhaka"
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Adoption Fee (TK)</label>
                <input type="number" required min="0" className="input-field min-h-[3.15rem] bg-white/85 text-sm" placeholder="0 for free"
                  value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Description</label>
              <textarea required rows="4" className="input-field min-h-32 resize-y bg-white/85 text-sm leading-6" placeholder="Tell us about the pet's personality, health, and habits..."
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Health Information (Optional)</label>
              <textarea rows="3" maxLength="2000" className="input-field min-h-24 resize-y bg-white/85 text-sm leading-6" placeholder="Share known health, vaccination, or care details."
                value={formData.healthInfo} onChange={(e) => setFormData({ ...formData, healthInfo: e.target.value })}></textarea>
            </div>

            <button type="submit" disabled={loading || uploading} className="btn-primary w-full py-4 text-base">
              {loading ? "Submitting..." : "Publish Pet Listing"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}