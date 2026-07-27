"use client";

import { useMemo, useState } from "react";
import { Filter, Plus, Search, Swords } from "lucide-react";
import { QuestCard } from "../quest-card";
import { AddQuestModal } from "../add-quest-modal";
import { useHunterStore } from "@/store/use-hunter-store";

export function QuestsView() {
  const quests = useHunterStore((state) => state.quests);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "COMPLETE">("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const visible = useMemo(
    () =>
      quests.filter((quest) => {
        const matchesQuery = `${quest.title} ${quest.detail}`.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = filter === "ALL" || (filter === "OPEN" ? !quest.completed : quest.completed);
        return matchesQuery && matchesFilter;
      }),
    [quests, query, filter],
  );

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="system-font text-[9px] font-bold tracking-[0.3em] text-blue-400">OBJECTIVE REGISTRY</p>
          <h1 className="system-font mt-2 text-2xl font-black sm:text-3xl">QUEST COMMAND</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">Choose your battles. The System handles the rewards.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="system-font flex h-11 items-center gap-2 border border-blue-400/40 bg-blue-500/15 px-5 text-[9px] font-bold tracking-[0.15em] text-blue-100 transition hover:bg-blue-500/25">
          <Plus size={15} /> FORGE QUEST
        </button>
      </div>

      <section className="system-panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the registry..." className="h-10 w-full border border-blue-300/12 bg-black/15 pl-10 pr-3 text-xs outline-none focus:border-blue-400/45" />
        </label>
        <div className="flex items-center gap-1">
          <Filter className="mr-2 text-slate-600" size={14} />
          {(["ALL", "OPEN", "COMPLETE"] as const).map((value) => (
            <button key={value} onClick={() => setFilter(value)} className={`system-font h-9 border px-3 text-[8px] tracking-wider transition ${filter === value ? "border-blue-400/35 bg-blue-500/10 text-cyan-200" : "border-transparent text-slate-600 hover:text-slate-300"}`}>
              {value}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <section className="system-panel p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="system-font text-[8px] tracking-[0.22em] text-blue-400">TODAY&apos;S PROTOCOL</p>
              <h2 className="system-font mt-1 text-sm font-bold">ACTIVE OBJECTIVES</h2>
            </div>
            <span className="system-font text-[8px] text-[var(--muted)]">{visible.length} QUESTS</span>
          </div>
          {visible.length ? (
            <div className="grid gap-2">
              {visible.map((quest) => <QuestCard expanded key={quest.id} quest={quest} />)}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center border border-dashed border-blue-300/15 text-center">
              <div>
                <Swords className="mx-auto mb-3 text-blue-300/35" size={28} />
                <p className="system-font text-xs font-bold">NO QUESTS DETECTED</p>
                <p className="mt-2 text-[10px] text-[var(--muted)]">Adjust the filter or forge a new objective.</p>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="system-panel p-5">
            <p className="system-font text-[8px] tracking-[0.22em] text-purple-300">DUNGEON BREAK</p>
            <h3 className="system-font mt-2 text-lg font-black">THE IRON PATH</h3>
            <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">Run a total of 20km before the weekly gate closes.</p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between system-font text-[8px]"><span>12.4 KM</span><span className="text-purple-300">62%</span></div>
              <div className="h-1.5 bg-white/5"><div className="h-full w-[62%] bg-gradient-to-r from-purple-600 to-fuchsia-300" /></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-center">
              <div className="border border-white/5 bg-white/[0.02] p-3"><p className="system-font text-xs font-bold text-purple-200">600</p><p className="mt-1 text-[8px] text-[var(--muted)]">BONUS XP</p></div>
              <div className="border border-white/5 bg-white/[0.02] p-3"><p className="system-font text-xs font-bold text-amber-200">RARE</p><p className="mt-1 text-[8px] text-[var(--muted)]">TITLE DROP</p></div>
            </div>
          </div>
          <div className="system-panel border-rose-400/20 p-5">
            <p className="system-font text-[8px] tracking-[0.22em] text-rose-300">PENALTY ZONE</p>
            <h3 className="mt-2 text-sm font-semibold">No active debuffs</h3>
            <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">Your discipline is stable. Missed quests can be redeemed with a short recovery objective—no guilt, just another chance.</p>
          </div>
        </aside>
      </div>
      <AddQuestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
