"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import Image from "next/image";
import { motion } from "framer-motion";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/my-tickets", label: "My Tickets" },
  ];

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 h-16"
    >
      <div className="absolute inset-0 bg-canvas/80 backdrop-blur-xl border-b border-white/[0.06]" />
      
      <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight hidden sm:block">
              EventJini
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "text-white bg-white/[0.06]" 
                      : "text-muted hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-xs text-muted hover:text-white">
              Host an Event
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm" className="text-xs px-5">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
