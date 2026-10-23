import { PawPrint } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <PawPrint className="text-primary w-6 h-6" />
          <span className="font-heading text-xl font-bold text-dark">Pet House</span>
        </div>
        <p className="text-light text-sm">
          © {new Date().getFullYear()} Pet House. All rights reserved.
        </p>
      </div>
    </footer>
  );
}