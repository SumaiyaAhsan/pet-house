"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-light hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="card bg-white p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark mb-6">Add a New Pet</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Pet Photo</label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded-xl border" />
                )}
                <label className="cursor-pointer btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                  <Upload className="w-5 h-5" />
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Pet Name</label>
                <input type="text" required className="input-field" placeholder="e.g. Buddy"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              {/* Hardcoded Species Dropdown */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Species</label>
                <select required className="input-field" value={formData.species}
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
                <label className="block text-sm font-medium text-dark mb-1">Breed (Optional)</label>
                <input type="text" className="input-field" placeholder="e.g. Golden Retriever"
                  value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Age (Years)</label>
                <input type="number" required min="0" step="0.5" className="input-field" placeholder="e.g. 2"
                  value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Gender</label>
                <select className="input-field" value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Location</label>
                <input type="text" required className="input-field" placeholder="e.g. Dhaka"
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Adoption Fee (TK)</label>
                <input type="number" required min="0" className="input-field" placeholder="0 for free"
                  value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1">Description</label>
              <textarea required rows="4" className="input-field" placeholder="Tell us about the pet's personality, health, and habits..."
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>

            <button type="submit" disabled={loading || uploading} className="btn-primary w-full py-3 text-lg">
              {loading ? "Submitting..." : "Publish Pet Listing"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}