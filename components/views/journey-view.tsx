"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Flame,
  Focus,
  Lock,
  Medal,
  Shield,
  Sparkles,
  Swords,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useHunterStore } from "@/store/use-hunter-store";

const ranks = [
  { rank: "E", level: "1–10" },
  { rank: "D", level: "11–25" },
  { rank: "C", level: "26–45" },
  { rank: "B", level: "46–70" },
  { rank: "A", level: "71–100" },
  { rank: "S", level: "101+" },
];

const skills = [
  {
    id: "steady-start",
    title: "Steady Start",
    detail: "The first quest of each day earns 10 bonus XP.",
    icon: Flame,
    cost: 0,
  },
  {
    id: "deep-focus",
    title: "Deep Focus",
    detail: "Focus quests receive a small experience bonus.",
    icon: Focus,
    cost: 1,
  },
  {
    id: "iron-will",
    title: "Iron Will",
    detail: "Protect one missed daily quest from affecting discipline.",
    icon: Shield,
    cost: 2,
  },
  {
    id: "quick-learner",
    title: "Quick Learner",
    detail: "Completing three different attributes grants bonus XP.",
    icon: Brain,
    cost: 2,
  },
];

type Equipment = {
  itemId: string;
  equipped: boolean;
  item: { id: string; name: string; description: string; type: "TITLE" | "AVATAR_FRAME" | "ACCENT_SKIN" };
};

export function JourneyView() {
  const hunter = useHunterStore((state) => state.hunter);
  const skillPoints = useHunterStore((state) => state.skillPoints);
  const unlockedSkills = useHunterStore((state) => state.unlockedSkills);
  const unlockSkill = useHunterStore((state) => state.unlockSkill);
  const chooseClass = useHunterStore((state) => state.chooseClass);
  const rebirth = useHunterStore((state) => state.rebirth);
  const [notice, setNotice] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const currentRankIndex = ranks.findIndex((item) => item.rank === hunter.rank);
  const nextRank = ranks[currentRankIndex + 1];

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  }

  async function handleUnlock(id: string, cost: number, title: string) {
    const response = await fetch("/api/skills/unlock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ skillKey: id }),
    });
    if (response.ok && unlockSkill(id, cost)) showNotice(`${title} unlocked`);
    else if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      showNotice(result.error || "Skill could not be unlocked");
    }
  }

  async function handleClass(hunterClass: "ASSASSIN" | "MAGE" | "TANK") {
    const response = await fetch("/api/class", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hunterClass }),
    });
    if (response.ok) chooseClass(hunterClass);
    else showNotice(((await response.json()) as { error?: string }).error || "Class could not be selected");
  }

  async function handleRebirth() {
    const response = await fetch("/api/rebirth", { method: "POST" });
    if (response.ok) rebirth();
    else showNotice(((await response.json()) as { error?: string }).error || "Rebirth could not begin");
  }

  useEffect(() => {
    void fetch("/api/equipment")
      .then((response) => response.ok ? response.json() : { items: [] })
      .then((result: { items?: Equipment[] }) => setEquipment(result.items ?? []))
      .catch(() => undefined);
  }, []);

  async function equip(item: Equipment) {
    const response = await fetch("/api/equipment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId: item.itemId }),
    });
    if (!response.ok) {
      showNotice(((await response.json()) as { error?: string }).error || "Item could not be equipped");
      return;
    }
    setEquipment((current) => current.map((entry) => ({
      ...entry,
      equipped: entry.item.type === item.item.type ? entry.itemId === item.itemId : entry.equipped,
    })));
    showNotice(`${item.item.name} equipped`);
  }

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Your journey</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">Build skills, earn rewards, and work toward your next rank.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2">
          <Sparkles size={15} className="text-indigo-600" />
          <span className="text-xs"><strong>{skillPoints}</strong> skill points</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Rank progression</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">You are Rank {hunter.rank}, Level {hunter.level}</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
                {nextRank ? `${Number.parseInt(nextRank.level) - hunter.level} levels to Rank ${nextRank.rank}` : "Highest rank reached"}
              </span>
            </div>
            <div className="mt-7 overflow-x-auto pb-2 scrollbar-none">
              <div className="flex min-w-[510px] items-center">
                {ranks.map(({ rank, level }, index) => {
                  const current = rank === hunter.rank;
                  const passed = index < ranks.findIndex((item) => item.rank === hunter.rank);
                  return (
                    <div key={rank} className="flex flex-1 items-center last:flex-none">
                      <div className="text-center">
                        <div className={`grid size-9 place-items-center rounded-full border text-xs font-semibold ${current ? "border-indigo-600 bg-indigo-600 text-white" : passed ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]"}`}>
                          {passed ? <Check size={14} /> : rank}
                        </div>
                        <p className="mt-2 text-[9px] text-[var(--muted)]">{level}</p>
                      </div>
                      {index < ranks.length - 1 && <div className={`mx-2 mb-5 h-px flex-1 ${passed || current ? "bg-indigo-200" : "bg-[var(--line)]"}`} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="system-panel p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold">Skills</h2>
                <p className="mt-1 text-[11px] text-[var(--muted)]">Spend points earned from levels and challenges.</p>
              </div>
              <BookOpen size={18} className="text-[var(--muted)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {skills.map(({ id, title, detail, icon: Icon, cost }) => {
                const unlocked = unlockedSkills.includes(id);
                const affordable = skillPoints >= cost;
                return (
                  <div key={id} className={`rounded-2xl border p-4 ${unlocked ? "border-emerald-200 bg-emerald-50/40" : "border-[var(--line)]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className={`grid size-9 place-items-center rounded-xl ${unlocked ? "bg-emerald-100 text-emerald-700" : "bg-indigo-50 text-indigo-600"}`}><Icon size={16} /></div>
                      {unlocked ? <span className="rounded-full bg-white px-2 py-1 text-[9px] font-medium text-emerald-700">Active</span> : <span className="text-[10px] text-[var(--muted)]">{cost} {cost === 1 ? "point" : "points"}</span>}
                    </div>
                    <h3 className="mt-4 text-xs font-semibold">{title}</h3>
                    <p className="mt-1.5 min-h-8 text-[10px] leading-relaxed text-[var(--muted)]">{detail}</p>
                    {!unlocked && (
                      <button disabled={!affordable} onClick={() => void handleUnlock(id, cost, title)} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--bg)] py-2 text-[10px] font-medium transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-45">
                        {affordable ? "Unlock skill" : <><Lock size={11} /> Need more points</>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="system-panel overflow-hidden p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium text-rose-600">Weekly challenge</p>
                <h2 className="mt-1 text-base font-semibold">No active challenge</h2>
                <p className="mt-1 text-[11px] text-[var(--muted)]">Your first challenge will appear after you build some quest history.</p>
              </div>
              <div className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600"><Swords size={18} /></div>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-rose-50" />
          </section>

          <section className="system-panel p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Rewards</h2><span className="text-[10px] text-[var(--muted)]">Inventory</span></div>
            <div className="space-y-2">
              {equipment.map((entry) => (
                <div key={entry.itemId} className="rounded-2xl border border-[var(--line)] p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Medal size={15} /></div>
                    <div className="min-w-0 flex-1"><p className="text-[11px] font-medium">{entry.item.name}</p><p className="mt-0.5 truncate text-[9px] text-[var(--muted)]">{entry.item.description}</p></div>
                    <span className="rounded-full bg-[var(--bg)] px-2 py-1 text-[9px]">{entry.item.type.toLowerCase().replace("_", " ")}</span>
                  </div>
                  <button disabled={entry.equipped} onClick={() => void equip(entry)} className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-medium text-indigo-600 hover:bg-indigo-50 disabled:text-emerald-600">{entry.equipped ? "Equipped" : <>Equip <ChevronRight size={10} /></>}</button>
                </div>
              ))}
              {!equipment.length && <div className="rounded-2xl border border-dashed border-[var(--line)] p-5 text-center"><p className="text-xs font-medium">No equipment yet</p><p className="mt-1 text-[10px] text-[var(--muted)]">Your first reward unlocks after completing a quest.</p></div>}
            </div>
          </section>
        </aside>
      </div>

      <section className="system-panel mt-5 p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Recent journey</h2>
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--line)] px-5 py-8 text-center">
          <p className="text-sm font-medium">Your journey is new</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Completed quests, unlocked skills, and milestones will appear here.</p>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="system-panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Hunter class</h2>
          <p className="mt-1 text-[11px] text-[var(--muted)]">{hunter.hunterClass ? `${hunter.hunterClass.toLowerCase()} class active` : hunter.level < 10 ? `Unlocks at Level 10 · ${10 - hunter.level} levels remaining` : "Choose once. Your matching stat earns 15% bonus XP."}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["ASSASSIN", "MAGE", "TANK"] as const).map((hunterClass) => (
              <button key={hunterClass} disabled={hunter.level < 10 || Boolean(hunter.hunterClass)} onClick={() => void handleClass(hunterClass)} className={`rounded-xl border px-2 py-3 text-[10px] font-medium disabled:cursor-not-allowed disabled:opacity-45 ${hunter.hunterClass === hunterClass ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-[var(--line)]"}`}>{hunterClass.toLowerCase()}</button>
            ))}
          </div>
        </section>
        <section className="system-panel p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Rebirth</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">S-rank hunters can restart at Level 1 and permanently add 5% to all future XP.</p>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--bg)] p-3"><span className="text-xs">Current multiplier</span><span className="text-xs font-semibold text-violet-600">×{hunter.globalXpMultiplier.toFixed(2)}</span></div>
          <button disabled={hunter.rank !== "S"} onClick={() => void handleRebirth()} className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">Begin rebirth</button>
        </section>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-24 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-xl md:bottom-6">
            <Check size={14} className="text-emerald-400" /> {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
