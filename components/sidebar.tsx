"use client";

import {
  BarChart3,
  Crosshair,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";

const nav = [
  { id: "dashboard", label: "Command", icon: LayoutDashboard },
  { id: "quests", label: "Quests", icon: Crosshair },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "profile", label: "Hunter", icon: UserRound },
] as const;

export function Sidebar() {
  const active = useHunterStore((state) => state.activeView);
  const setView = useHunterStore((state) => state.setView);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[88px] border-r border-blue-300/10 bg-[#050a12]/88 backdrop-blur-xl md:flex md:flex-col xl:w-[250px]">
        <div className="flex h-[78px] items-center gap-3 border-b border-blue-300/10 px-5 xl:px-7">
          <div className="grid size-10 shrink-0 place-items-center border border-cyan-300/45 bg-blue-500/10 text-cyan-300 shadow-[0_0_25px_rgba(59,130,246,.22)]">
            <Shield size={21} strokeWidth={1.7} />
          </div>
          <div className="hidden xl:block">
            <div className="system-font text-lg font-black tracking-[0.24em] text-white">ASCEND</div>
            <div className="system-font text-[8px] tracking-[0.28em] text-blue-400">HUNTER SYSTEM</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 px-3 py-7">
          {nav.map(({ id, label, icon: Icon }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                aria-label={label}
                onClick={() => setView(id)}
                className={`group relative flex h-12 items-center justify-center gap-4 border px-3 transition xl:justify-start xl:px-4 ${
                  selected
                    ? "border-blue-400/35 bg-blue-500/12 text-cyan-200"
                    : "border-transparent text-slate-600 hover:bg-white/[0.025] hover:text-slate-300"
                }`}
              >
                {selected && <span className="absolute -left-3 h-7 w-[2px] bg-cyan-300 shadow-[0_0_14px_#38bdf8]" />}
                <Icon size={19} strokeWidth={1.8} />
                <span className="system-font hidden text-[10px] font-semibold tracking-[0.16em] xl:block">{label.toUpperCase()}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-blue-300/10 p-3">
          <button className="flex h-11 w-full items-center justify-center gap-4 text-slate-600 transition hover:text-slate-300 xl:justify-start xl:px-4">
            <Settings size={18} />
            <span className="system-font hidden text-[9px] tracking-widest xl:block">SETTINGS</span>
          </button>
          <button className="flex h-11 w-full items-center justify-center gap-4 text-slate-600 transition hover:text-rose-300 xl:justify-start xl:px-4">
            <LogOut size={18} />
            <span className="system-font hidden text-[9px] tracking-widest xl:block">DISCONNECT</span>
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-around border border-blue-300/20 bg-[#07101d]/95 px-2 shadow-2xl backdrop-blur-xl md:hidden">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-label={label}
            onClick={() => setView(id)}
            className={`flex min-w-16 flex-col items-center gap-1.5 text-[9px] transition ${
              active === id ? "text-cyan-300" : "text-slate-600"
            }`}
          >
            <Icon size={19} />
            <span className="system-font tracking-wider">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
