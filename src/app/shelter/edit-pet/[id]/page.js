"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

export default function EditPetPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pets/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setFormData(data);
      })
      .catch((err) => toast.error("Failed to load pet data"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
      toast.success("New image loaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update pet");
      
      toast.success("Pet updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-light">Loading pet data...</div>;
  if (!formData) return <div className="min-h-screen flex items-center justify-center text-light">Pet not found.</div>;

  return (
    <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-light hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="card bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-heading font-bold text-dark mb-6">Edit {formData.name}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Pet Photo</label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded-xl border" />
                )}
                <label className="cursor-pointer btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                  <Upload className="w-5 h-5" /> Change Image
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Pet Name</label>
                <input type="text" required className="input-field" 
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Adoption Fee (TK)</label>
                <input type="number" required min="0" className="input-field" 
                  value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Species</label>
                <select className="input-field" value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })}>
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
                <label className="block text-sm font-medium text-dark mb-1">Location</label>
                <input type="text" required className="input-field" 
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1">Description</label>
              <textarea required rows="4" className="input-field"
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-lg">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}