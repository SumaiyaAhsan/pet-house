"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PawPrint, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success("Account created successfully! Please login.");
      router.push("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-88px)] bg-secondary lg:grid-cols-[1fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#111214] lg:block">
        <Image
          src="/registration.jpg"
          alt="A woman holding her adopted dog"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-[#111214]/20 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <PawPrint className="mb-5 h-10 w-10 text-primary" />
          <p className="max-w-lg font-heading text-4xl font-bold leading-tight">
            Give a pet a beginning worth wagging about.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="section-kicker mb-3">Join Pet House</p>
            <h1 className="section-heading !text-4xl">Create an account</h1>
            <p className="mt-3 text-sm text-light">Adopt a companion or share a pet in need of a home.</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                className="input-field !pl-12"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                className="input-field !pl-12"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

           {/* Password */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="input-field !pl-12 !pr-12"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {/* Eye Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 rounded-full p-1 text-gray-400 transition hover:bg-[#FF9B55] hover:text-black"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">I am a...</label>
            <select
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="shelter">Pet Owner</option>
              <option value="user">Pet Adopter</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-light mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary transition-colors hover:text-[#b94b00] hover:underline">
            Login here
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
}