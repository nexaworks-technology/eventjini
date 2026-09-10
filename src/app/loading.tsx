"use client";

import { motion } from "framer-motion";

export default function RootLoading() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-8">
        {/* Spinning ring */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-white/[0.06] border-t-brand-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-muted tracking-wider uppercase"
        >
          Loading...
        </motion.span>
      </div>
    </div>
  );
}
