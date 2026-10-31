import Link from "next/link";
import { Heart, ShieldCheck, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">

     
      {/*Hero Section*/}
      <section className="bg-secondary py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-5xl md:text-6xl font-heading font-bold text-dark mb-6 leading-tight">
            Find Your New <span className="text-primary">Best Friend</span>
          </h1>
          
          <p className="text-light text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Adopt a loving pet or book premium care services. Your journey to a happier home starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pets" className="btn-primary text-lg px-8 py-4">
              Adopt a Pet
            </Link>
           
            <Link href="/services" className="btn-secondary text-lg px-8 py-4">
              Book a Service
            </Link>
          </div>
        </div>
      </section>



      {/*Features Section*/}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-dark">Why Choose Pet House?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 text-center">
            <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-2">Loving Pets</h3>
            <p className="text-light">All our pets are health-checked and ready for a loving home.</p>
          </div>
          <div className="card p-8 text-center">
            <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-2">Trusted Shelters</h3>
            <p className="text-light">We partner with verified shelters to ensure a safe adoption process.</p>
          </div>
          <div className="card p-8 text-center">
            <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-2">Easy Booking</h3>
            <p className="text-light">Book grooming, boarding, and vet visits with just a few clicks.</p>
          </div>
        </div>
      </section>
    </div>
  );
}