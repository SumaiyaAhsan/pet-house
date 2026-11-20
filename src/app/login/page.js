"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PawPrint, Mail, Lock, Eye, EyeOff } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for eye toggle


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }


      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("pet-house:user-updated"));

      toast.success("Logged in successfully!");
      

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (data.user.role === "shelter") {
        router.push("/shelter/add-pet");
      } else {
        router.push("/");
      }
     
      

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="grid min-h-[calc(100vh-88px)] bg-secondary lg:grid-cols-[1fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#111214] lg:block">
        <img src="/hero-dog.jpg" alt="A happy adopted dog" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-[#111214]/20 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <PawPrint className="mb-5 h-10 w-10 text-primary" />
          <p className="max-w-lg font-heading text-4xl font-bold leading-tight">
            A safer way to find a friend and a loving home.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="section-kicker mb-3">Welcome back</p>
            <h1 className="section-heading !text-4xl">Login to Pet House</h1>
            <p className="mt-3 text-sm text-light">Continue where you left off.</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-5">
         
          {/*Email*/}

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


          {/*Password*/}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-dark">Password</label>
              <Link href="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                   Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"} 
                className="input-field !pl-12 !pr-12"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              
              
              {/*Eye_Button*/}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-primary transition"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>


          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>


        <p className="text-center text-sm text-light mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
}