"use client";

import { motion } from "framer-motion";

export function RankEmblem({ rank = "D", size = "large" }: { rank?: string; size?: "small" | "large" }) {
  const isLarge = size === "large";
  const colors: Record<string, string> = {
    E: "#8ca0b5",
    D: "#45efae",
    C: "#4da6ff",
    B: "#a875ff",
    A: "#ff9f43",
    S: "#ffd45c",
  };
  const color = colors[rank] ?? colors.D;

  return (
    <motion.div
      className={`relative grid shrink-0 place-items-center ${isLarge ? "size-[126px]" : "size-11"}`}
      initial={{ rotate: -6, scale: 0.95 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ type: "spring", damping: 16 }}
    >
      <div
        className="absolute inset-[8%] rotate-45 border"
        style={{ borderColor: `${color}66`, boxShadow: `inset 0 0 24px ${color}18, 0 0 26px ${color}18` }}
      />
      <div className="absolute inset-[19%] rotate-45 border border-white/10 bg-black/20" />
      <span
        className={`system-font relative font-black ${isLarge ? "text-6xl" : "text-xl"}`}
        style={{ color, textShadow: `0 0 24px ${color}90` }}
      >
        {rank}
      </span>
      {isLarge && <span className="system-font absolute -bottom-1 text-[7px] tracking-[0.32em]" style={{ color }}>HUNTER RANK</span>}
    </motion.div>
  );
}
