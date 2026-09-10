"use client";

import Link from "next/link";
import Image from "next/image";

interface CityCardProps {
  name: string;
  count: number;
  image: string;
}

export function CityCard({ name, count, image }: CityCardProps) {
  return (
    <Link 
      href={`/explore?location=${encodeURIComponent(name.toLowerCase())}`} 
      className="group relative h-28 w-44 md:h-32 md:w-48 rounded-2xl overflow-hidden flex-shrink-0 snap-center border border-white/[0.04] hover:border-white/20 transition-colors"
    >
      <Image 
        src={image} 
        alt={name} 
        fill 
        className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090D]/90 via-[#07090D]/20 to-transparent" />
      
      <div className="absolute bottom-4 left-4 right-4">
        <h4 className="text-white font-semibold text-sm md:text-base tracking-wide drop-shadow-md group-hover:-translate-y-0.5 transition-transform duration-300">
          {name}
        </h4>
      </div>
    </Link>
  );
}
