"use client";
import { X, PawPrint } from "lucide-react";
import Link from "next/link";

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl flex overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-gray-600 p-2 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Image */}
        <div className="hidden md:block w-1/2 bg-secondary relative">
          <img 
            src="/paw.jpeg" 
            alt="Happy Pet" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <PawPrint className="text-primary w-10 h-10" />
              <span className="font-heading text-3xl font-bold text-dark">Pet House</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-dark mb-2">Welcome to Pet House</h2>
            <p className="text-light text-sm">
              Sign in to view pet details, chat with shelters, and start the adoption process.
            </p>
          </div>

          <div className="space-y-4">
            <Link 
              href="/login" 
              className="btn-primary w-full flex items-center justify-center py-3 text-lg"
            >
              Login to your Account
            </Link>
            
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-gray-200 absolute w-full"></div>
              <span className="bg-white px-4 text-sm text-light relative">or</span>
            </div>

            <Link 
              href="/register" 
              className="btn-secondary w-full flex items-center justify-center py-3 text-lg"
            >
              Create a New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}