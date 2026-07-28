"use client";

import { BarChart3, CheckSquare2, Compass, Home, Settings, TrendingUp, UserRound } from "lucide-react";
import Link from "next/link";
import { useHunterStore } from "@/store/use-hunter-store";

const nav = [
  { id: "dashboard", label: "Overview", icon: Home },
  { id: "quests", label: "Quests", icon: CheckSquare2 },
  { id: "journey", label: "Journey", icon: Compass },
  { id: "analytics", label: "Progress", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: UserRound },
] as const;

export function Sidebar() {
  const active = useHunterStore((state) => state.activeView);
  const setView = useHunterStore((state) => state.setView);

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
              onClick={() => setView(id)}
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
        <div className="p-3">
          <button className="flex h-11 w-full items-center justify-center gap-3 rounded-xl px-3 text-sm text-[var(--muted)] transition hover:bg-black/[0.035] xl:justify-start">
            <Settings size={18} />
            <span className="hidden xl:block">Settings</span>
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-around rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-2 shadow-lg md:hidden">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-label={label}
            onClick={() => setView(id)}
            className={`flex min-w-16 flex-col items-center gap-1 text-[10px] ${active === id ? "text-indigo-600" : "text-[var(--muted)]"}`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
