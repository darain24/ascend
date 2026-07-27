"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUp, X } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";

export function SystemNotification() {
  const overlay = useHunterStore((state) => state.overlay);
  const setOverlay = useHunterStore((state) => state.setOverlay);

  return (
    <AnimatePresence>
      {overlay && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#02050b]/88 px-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOverlay(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.72, filter: "blur(16px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={{ type: "spring", damping: 18, stiffness: 210 }}
            className="system-panel relative w-full max-w-xl overflow-hidden px-7 py-12 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            <button
              aria-label="Close notification"
              className="absolute right-4 top-4 text-slate-500 transition hover:text-white"
              onClick={() => setOverlay(null)}
            >
              <X size={18} />
            </button>
            <motion.div
              className="mx-auto mb-6 grid size-20 place-items-center rounded-full border border-cyan-300/40 bg-blue-500/10 text-cyan-300 shadow-[0_0_40px_rgba(59,130,246,.35)]"
              animate={{ boxShadow: ["0 0 20px rgba(59,130,246,.2)", "0 0 55px rgba(59,130,246,.55)", "0 0 20px rgba(59,130,246,.2)"] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              {overlay.kind === "quest" ? <Check size={38} /> : <ChevronsUp size={38} />}
            </motion.div>
            <p className="system-font mb-3 text-[10px] font-bold tracking-[0.48em] text-cyan-300">
              SYSTEM NOTIFICATION
            </p>
            <h2 className="system-font glow-text text-3xl font-black uppercase tracking-wider text-white sm:text-4xl">
              {overlay.title}
            </h2>
            <p className="mt-3 text-sm text-slate-400">{overlay.subtitle}</p>
            <button
              className="system-font mt-8 border border-blue-400/45 bg-blue-500/10 px-8 py-3 text-xs font-bold tracking-[0.2em] text-blue-200 transition hover:bg-blue-500/20"
              onClick={() => setOverlay(null)}
            >
              CONTINUE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
