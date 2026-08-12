"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, CheckSquare2, Compass, Sparkles, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useHunterStore } from "@/store/use-hunter-store";

const steps = [
  {
    eyebrow: "Welcome to Ascend",
    title: "Build progress one quest at a time",
    description: "Turn a real task into a quest, complete it, and earn XP. Your journey begins empty so every result is genuinely yours.",
    icon: Sparkles,
    points: ["No demo quests or fake progress", "Your account keeps everything in sync"],
  },
  {
    eyebrow: "The core loop",
    title: "Create. Complete. Ascend.",
    description: "Keep your first quest small and measurable. Completing quests improves your attributes, streak, level, and rank.",
    icon: CheckSquare2,
    points: ["Quests are your actionable tasks", "Journey shows levels, skills, and rewards"],
  },
  {
    eyebrow: "You are ready",
    title: "Choose your first step",
    description: "Start from the overview, or go directly to Quests and create the first challenge in your journey.",
    icon: Compass,
    points: ["Progress fills as you complete real quests", "You can revisit every feature from navigation"],
  },
] as const;

export function Onboarding({ open, onComplete }: { open: boolean; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const setView = useHunterStore((state) => state.setView);
  const reduceMotion = useReducedMotion();
  const current = steps[step];
  const Icon = current.icon;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  async function finish(destination: "dashboard" | "quests") {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/account/onboarding", { method: "PATCH" });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Your setup could not be saved.");
      setView(destination);
      onComplete();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your setup could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] grid items-end bg-slate-950/30 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:place-items-center sm:p-5"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduceMotion ? 1 : 0 }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-[var(--panel-solid)] text-[var(--text)] shadow-2xl"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 sm:px-7">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <span className="grid size-8 place-items-center rounded-xl bg-indigo-600 text-white"><TrendingUp size={16} /></span>
                Ascend
              </div>
              <button
                type="button"
                aria-label="Skip onboarding"
                title="Skip onboarding"
                disabled={saving}
                onClick={() => void finish("dashboard")}
                className="grid size-9 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--bg)] disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-6 flex gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
                {steps.map((item, index) => (
                  <span key={item.title} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${index <= step ? "bg-indigo-500" : "bg-[var(--line)]"}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -14 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon size={22} /></div>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">{current.eyebrow}</p>
                  <h2 id="onboarding-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{current.title}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">{current.description}</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {current.points.map((point) => (
                      <div key={point} className="flex items-center gap-2 rounded-xl bg-[var(--bg)] px-3 py-3 text-xs">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check size={12} /></span>
                        {point}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {error && <p role="alert" className="mt-4 text-xs text-rose-600">{error}</p>}
              <div className="mt-7 flex flex-col-reverse gap-2 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => step === 0 ? void finish("dashboard") : setStep((value) => value - 1)}
                  className="h-11 rounded-xl px-4 text-xs font-medium text-[var(--muted)] hover:bg-[var(--bg)] disabled:opacity-50"
                >
                  {step === 0 ? "Skip tour" : "Back"}
                </button>
                {step < steps.length - 1 ? (
                  <button type="button" onClick={() => setStep((value) => value + 1)} className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800">Continue</button>
                ) : (
                  <div className="flex flex-col gap-2 min-[430px]:flex-row">
                    <button type="button" disabled={saving} onClick={() => void finish("dashboard")} className="h-11 rounded-xl border border-[var(--line)] px-4 text-xs font-medium disabled:opacity-50">View overview</button>
                    <button type="button" disabled={saving} onClick={() => void finish("quests")} className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white disabled:opacity-50">
                      {saving ? "Saving…" : "Create my first quest"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
