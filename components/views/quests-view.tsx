"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { QuestCard } from "../quest-card";
import { AddQuestModal } from "../add-quest-modal";
import { useHunterStore } from "@/store/use-hunter-store";

export function QuestsView() {
  const quests = useHunterStore((state) => state.quests);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "COMPLETE">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const visible = useMemo(() => quests.filter((quest) => {
    const matchesQuery = `${quest.title} ${quest.detail}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "ALL" || (filter === "OPEN" ? !quest.completed : quest.completed));
  }), [quests, query, filter]);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Quests</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">Small actions that move you forward.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white min-[380px]:w-auto"><Plus size={15} /> Add quest</button>
      </div>

      <section className="system-panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search quests" className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] pl-10 pr-3 text-xs outline-none focus:border-indigo-300" />
        </label>
        <div className="grid grid-cols-3 rounded-xl bg-[var(--bg)] p-1">
          {(["ALL", "OPEN", "COMPLETE"] as const).map((value) => (
            <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-[10px] font-medium capitalize transition ${filter === value ? "bg-[var(--panel)] text-[var(--text)] shadow-sm" : "text-[var(--muted)]"}`}>{value.toLowerCase()}</button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <section className="system-panel p-4 sm:p-5">
          <div className="mb-4 flex justify-between"><h2 className="text-sm font-semibold">Your list</h2><span className="text-xs text-[var(--muted)]">{visible.length} quests</span></div>
          <div className="grid gap-2">{visible.map((quest) => <QuestCard expanded key={quest.id} quest={quest} />)}</div>
          {visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--line)] px-5 py-10 text-center">
              <p className="text-sm font-medium">{quests.length ? "No matching quests" : "No quests yet"}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{quests.length ? "Try a different search or filter." : "Add your first quest to begin your journey."}</p>
              {!quests.length && <button onClick={() => setModalOpen(true)} className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white">Add first quest</button>}
            </div>
          )}
        </section>
        <aside className="space-y-5">
          <div className="system-panel p-5">
            <p className="text-sm font-semibold">No weekly challenge</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">Challenges will unlock as you complete quests and build consistent activity.</p>
          </div>
          <div className="system-panel p-5">
            <p className="text-sm font-semibold">A gentle reminder</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">Missing a quest is not failure. Adjust the goal, try again tomorrow, and keep the routine sustainable.</p>
          </div>
        </aside>
      </div>
      <AddQuestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
