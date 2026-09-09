"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-2xl">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-3xl">
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-cyan-500 blur-[2px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="w-16 h-16 rounded-full border-t-2 border-b-2 border-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-8 h-8 rounded-full border-l-2 border-purple-500"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg font-medium text-white/90 tracking-wide"
        >
          Loading EventJini...
        </motion.div>
      </div>
    </div>
  );
}
