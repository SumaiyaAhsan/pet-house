"use client";
import Link from "next/link";
import { PawPrint, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

// A list of beautiful background colors for profile avatars
const AVATAR_COLORS = [
  "bg-red-500", "bg-orange-500", "bg-amber-500", 
  "bg-green-500", "bg-emerald-500", "bg-teal-500", 
  "bg-blue-500", "bg-indigo-500", "bg-purple-500", 
  "bg-pink-500"
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/");
  };

  // Function to get a color based on the user's name
  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-500";
    let charCodeSum = 0;
    for (let i = 0; i < name.length; i++) {
      charCodeSum += name.charCodeAt(i);
    }
    return AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];
  };

  // Function to render the avatar circle
  const renderAvatar = () => {
    if (!user) return null;
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${getAvatarColor(user.name)}`}>
        {user.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="text-primary w-8 h-8" />
            <span className="font-heading text-2xl font-bold text-dark">
              Pet House
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/pets" className="text-light hover:text-primary transition font-medium">
              Browse Pets
            </Link>
            <Link href="/services" className="text-light hover:text-primary transition font-medium">
              Services
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                
                {/* Profile & Logout */}
                <div className="flex items-center gap-3">
                  {renderAvatar()}
                  <span className="text-sm font-bold text-dark">{user.name.split(" ")[0]}</span>
                </div>

                <button onClick={handleLogout} className="text-light hover:text-red-500 transition" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-4">
                <Link href="/login" className="btn-secondary py-2 px-4 text-sm">
                  Login
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-light hover:text-primary">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link href="/pets" className="block px-3 py-2 text-light hover:text-primary font-medium">
              Browse Pets
            </Link>
            <Link href="/services" className="block px-3 py-2 text-light hover:text-primary font-medium">
              Services
            </Link>
            
            {user ? (
              <div className="mt-4 flex flex-col gap-3 px-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  {renderAvatar()}
                  <span className="text-sm font-bold text-dark">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-center py-2 text-red-500 border-red-500 hover:bg-red-50 flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2 px-3">
                <Link href="/login" className="btn-secondary text-center py-2">Login</Link>
                <Link href="/register" className="btn-primary text-center py-2">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}