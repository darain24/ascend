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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/quests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, detail, stat, difficulty, type: "CUSTOM" }),
      });
      const result = (await response.json()) as { quest?: Parameters<typeof addQuest>[0]; error?: string };
      if (!response.ok || !result.quest) throw new Error(result.error || "Quest could not be created.");
      addQuest(result.quest);
      setTitle("");
      setDetail("");
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Quest could not be created.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/25 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Add a new quest</h2>
                <p className="mt-1 text-xs text-slate-500">Choose something realistic and meaningful.</p>
              </div>
              <button type="button" aria-label="Close" onClick={onClose} className="text-slate-600 hover:text-white">
                <X size={19} />
              </button>
            </div>
            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-medium text-slate-600">Quest name</span>
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Conquer the morning run"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400"
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-2 block text-xs font-medium text-slate-600">Description</span>
              <input
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="Define the victory condition"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400"
              />
            </label>
            <div className="mb-5 grid grid-cols-2 gap-4">
              <label>
                <span className="mb-2 block text-xs font-medium text-slate-600">Attribute</span>
                <select value={stat} onChange={(event) => setStat(event.target.value as StatKey)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-indigo-400">
                  {STAT_KEYS.map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-medium text-slate-600">Difficulty</span>
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as keyof typeof DIFFICULTY_XP)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-indigo-400">
                  {Object.keys(DIFFICULTY_XP).map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
            </div>
            <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs">
              <span className="text-slate-500">Reward</span>
              <span className="font-semibold text-indigo-600">+{DIFFICULTY_XP[difficulty]} XP</span>
            </div>
            {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}
            <button disabled={saving} type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
              <Plus size={15} /> {saving ? "Saving…" : "Add quest"}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
