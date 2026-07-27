"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";

export function SystemNotification() {
  const overlay = useHunterStore((state) => state.overlay);
  const setOverlay = useHunterStore((state) => state.setOverlay);
  return (
    <AnimatePresence>
      {overlay && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-black/25 px-5 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOverlay(null)}>
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="relative w-full max-w-sm rounded-3xl bg-white px-7 py-8 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button aria-label="Close" className="absolute right-5 top-5 text-slate-400" onClick={() => setOverlay(null)}><X size={17} /></button>
            <div className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={22} /></div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{overlay.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{overlay.subtitle}</p>
            <button className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white" onClick={() => setOverlay(null)}>Continue</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
