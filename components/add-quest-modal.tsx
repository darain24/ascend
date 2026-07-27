"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { DIFFICULTY_XP, STAT_KEYS, type StatKey } from "@/lib/game-logic/constants";
import { useHunterStore } from "@/store/use-hunter-store";

export function AddQuestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addQuest = useHunterStore((state) => state.addQuest);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [stat, setStat] = useState<StatKey>("STR");
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY_XP>("NORMAL");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addQuest({
      id: `q-${Date.now()}`,
      title: title.trim(),
      detail: detail.trim() || "A custom hunter objective",
      stat,
      difficulty,
      xp: DIFFICULTY_XP[difficulty],
      type: "CUSTOM",
      completed: false,
    });
    setTitle("");
    setDetail("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(event) => event.stopPropagation()}
            className="system-panel w-full max-w-lg p-6 sm:p-8"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="system-font text-[8px] tracking-[0.28em] text-blue-400">QUEST FORGE</p>
                <h2 className="system-font mt-1 text-xl font-black">REGISTER OBJECTIVE</h2>
              </div>
              <button type="button" aria-label="Close" onClick={onClose} className="text-slate-600 hover:text-white">
                <X size={19} />
              </button>
            </div>
            <label className="mb-4 block">
              <span className="system-font mb-2 block text-[8px] tracking-wider text-[var(--muted)]">QUEST NAME</span>
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Conquer the morning run"
                className="h-12 w-full border border-blue-300/15 bg-black/20 px-4 text-sm outline-none transition placeholder:text-slate-700 focus:border-blue-400/55"
              />
            </label>
            <label className="mb-4 block">
              <span className="system-font mb-2 block text-[8px] tracking-wider text-[var(--muted)]">DESCRIPTION</span>
              <input
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="Define the victory condition"
                className="h-12 w-full border border-blue-300/15 bg-black/20 px-4 text-sm outline-none transition placeholder:text-slate-700 focus:border-blue-400/55"
              />
            </label>
            <div className="mb-5 grid grid-cols-2 gap-4">
              <label>
                <span className="system-font mb-2 block text-[8px] tracking-wider text-[var(--muted)]">ATTRIBUTE</span>
                <select value={stat} onChange={(event) => setStat(event.target.value as StatKey)} className="h-12 w-full border border-blue-300/15 bg-[var(--panel-solid)] px-3 text-xs outline-none focus:border-blue-400/55">
                  {STAT_KEYS.map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>
                <span className="system-font mb-2 block text-[8px] tracking-wider text-[var(--muted)]">DIFFICULTY</span>
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as keyof typeof DIFFICULTY_XP)} className="h-12 w-full border border-blue-300/15 bg-[var(--panel-solid)] px-3 text-xs outline-none focus:border-blue-400/55">
                  {Object.keys(DIFFICULTY_XP).map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
            </div>
            <div className="mb-6 flex items-center justify-between border border-blue-300/10 bg-blue-400/[0.025] px-4 py-3 text-[10px]">
              <span className="text-[var(--muted)]">System-calculated reward</span>
              <span className="system-font font-bold text-cyan-300">+{DIFFICULTY_XP[difficulty]} XP</span>
            </div>
            <button type="submit" className="system-font flex h-12 w-full items-center justify-center gap-2 border border-blue-400/40 bg-blue-500/15 text-[10px] font-bold tracking-[0.18em] text-blue-100 transition hover:bg-blue-500/25">
              <Plus size={15} /> CREATE QUEST
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
