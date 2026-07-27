"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="scanline absolute inset-x-0 h-40 opacity-30" />
      <motion.div
        className="absolute -left-48 top-10 size-[480px] rounded-full bg-blue-600/8 blur-[110px]"
        animate={{ x: [0, 90, 0], y: [0, 55, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 bottom-10 size-[430px] rounded-full bg-cyan-500/6 blur-[120px]"
        animate={{ x: [0, -70, 0], y: [0, -80, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />
      {Array.from({ length: 18 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute size-px rounded-full bg-cyan-200"
          style={{ left: `${(index * 37) % 98}%`, top: `${(index * 61) % 94}%` }}
          animate={{ opacity: [0.08, 0.7, 0.08], scale: [1, 2.4, 1] }}
          transition={{ duration: 3 + (index % 5), repeat: Infinity, delay: index * 0.18 }}
        />
      ))}
    </div>
  );
}
