"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const borderColor = useTransform(scrollY, [0, 50], ["rgba(255,255,255,0)", "rgba(255,255,255,0.06)"]);

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/my-tickets", label: "My Tickets" },
    { href: "/dashboard", label: "Host an Event" },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50 h-16"
      >
        <motion.div 
          style={{ opacity: bgOpacity, borderBottomColor: borderColor }}
          className="absolute inset-0 bg-[#07090D]/80 backdrop-blur-xl border-b" 
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
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
              {navLinks.slice(0, 2).map((link) => {
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
            <Link href="/login" className="hidden sm:block">
              <Button variant="primary" size="sm" className="text-xs px-5">
                Sign In
              </Button>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-surface border-b border-white/[0.06] p-4 md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-4 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === link.href ? "bg-white/[0.06] text-white" : "text-muted hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-white/[0.04] my-2" />
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full py-4 text-sm font-bold">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
