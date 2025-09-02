import { ImagesSlider } from "../components/ImageSlider";
import Link from "next/link";

export function HeroSection() {
  const images = [
    "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
  ];

  return (
    <div className="h-[70vh] w-full relative">
      <ImagesSlider className="h-full" images={images}>
        <div className="z-50 flex flex-col justify-center items-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl">
            Smart Talora
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-lg">
            Streamline your hiring process with AI-powered matching, automated workflows, 
            and comprehensive candidate management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
                       className="px-8 py-3 bg-white/20 backdrop-blur-md text-white rounded-md hover:bg-white/30 font-medium border border-white/20 transition-all shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </ImagesSlider>
    </div>
  );
}