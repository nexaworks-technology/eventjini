"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { Ticket, Search, User } from "lucide-react";
import Image from "next/image";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-lg text-white hidden sm:block">EventJini</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/explore" 
              className={`text-sm font-medium transition-colors hover:text-white ${pathname === '/explore' ? 'text-white' : 'text-slate-400'}`}
            >
              Explore Events
            </Link>
            <Link 
              href="/my-tickets" 
              className={`text-sm font-medium transition-colors hover:text-white ${pathname === '/my-tickets' ? 'text-white' : 'text-slate-400'}`}
            >
              My Tickets
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="secondary" size="sm" className="text-xs">
              Host an Event
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm" className="text-xs px-4">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
