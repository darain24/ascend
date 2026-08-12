"use client";

import { BarChart3, Bot, CheckSquare2, Compass, Home, MoreHorizontal, Settings, Shield, TrendingUp, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useHunterStore } from "@/store/use-hunter-store";

const nav = [
  { id: "dashboard", label: "Overview", icon: Home },
  { id: "quests", label: "Quests", icon: CheckSquare2 },
  { id: "journey", label: "Journey", icon: Compass },
  { id: "analytics", label: "Progress", icon: BarChart3 },
  { id: "system", label: "System", icon: Bot },
  { id: "guild", label: "Guild", icon: Shield },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const mobilePrimary = nav.filter(({ id }) => ["dashboard", "quests", "journey", "profile"].includes(id));
const mobileMore = nav.filter(({ id }) => ["analytics", "system", "guild", "settings"].includes(id));

export function Sidebar() {
  const active = useHunterStore((state) => state.activeView);
  const setView = useHunterStore((state) => state.setView);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreIsActive = mobileMore.some(({ id }) => id === active);

  useEffect(() => {
    if (!moreOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [moreOpen]);

  function selectView(id: (typeof nav)[number]["id"]) {
    setView(id);
    setMoreOpen(false);
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col border-r border-[var(--line)] bg-[var(--panel)] md:flex xl:w-[232px]">
        <Link
          href="/"
          aria-label="Go to Ascend homepage"
          onClick={() => setView("dashboard")}
          className="flex h-[72px] items-center gap-3 px-5 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 xl:px-7"
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white">
            <TrendingUp size={18} strokeWidth={2.2} />
          </div>
          <span className="hidden text-[17px] font-semibold tracking-tight xl:block">Ascend</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-label={label}
              onClick={() => selectView(id)}
              className={`flex h-11 items-center justify-center gap-3 rounded-xl px-3 text-sm transition xl:justify-start ${
                active === id
                  ? "bg-indigo-50 font-medium text-indigo-700"
                  : "text-[var(--muted)] hover:bg-black/[0.035] hover:text-[var(--text)]"
              }`}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span className="hidden xl:block">{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {moreOpen && (
        <button
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px] md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <section
          aria-label="More navigation"
          className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 shadow-xl md:hidden"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold">More</p>
            <button aria-label="Close menu" onClick={() => setMoreOpen(false)} className="grid size-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--bg)]"><X size={15} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mobileMore.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => selectView(id)}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-xs font-medium ${active === id ? "bg-indigo-50 text-indigo-700" : "bg-[var(--bg)] text-[var(--muted)]"}`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      <nav aria-label="Primary navigation" className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 grid h-[68px] grid-cols-5 items-center rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-1 shadow-lg md:hidden">
        {mobilePrimary.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-label={label}
            onClick={() => selectView(id)}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] leading-none ${active === id ? "bg-indigo-50 text-indigo-700" : "text-[var(--muted)]"}`}
          >
            <Icon size={18} />
            <span className="max-w-full truncate px-0.5">{label}</span>
          </button>
        ))}
        <button
          aria-label="More navigation"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
          className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] leading-none ${moreOpen || moreIsActive ? "bg-indigo-50 text-indigo-700" : "text-[var(--muted)]"}`}
        >
          <MoreHorizontal size={18} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
