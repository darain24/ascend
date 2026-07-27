"use client";

import { Bell, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";

export function Topbar() {
  const theme = useHunterStore((state) => state.theme);
  const setTheme = useHunterStore((state) => state.setTheme);
  const sound = useHunterStore((state) => state.sound);
  const toggleSound = useHunterStore((state) => state.toggleSound);

  return (
    <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-blue-300/10 bg-[color:var(--bg)]/80 px-4 backdrop-blur-xl sm:px-7">
      <div>
        <p className="system-font text-[9px] tracking-[0.26em] text-blue-400/80">SYSTEM ONLINE</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Monday, July 27 <span className="mx-2 text-blue-400/30">/</span> Daily reset in 08:42
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label={sound ? "Mute sound" : "Enable sound"}
          onClick={toggleSound}
          className="grid size-9 place-items-center border border-blue-300/10 text-[var(--muted)] transition hover:border-blue-300/30 hover:text-cyan-300"
        >
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="grid size-9 place-items-center border border-blue-300/10 text-[var(--muted)] transition hover:border-blue-300/30 hover:text-cyan-300"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button aria-label="Notifications" className="relative grid size-9 place-items-center border border-blue-300/10 text-[var(--muted)] transition hover:text-cyan-300">
          <Bell size={16} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
        </button>
        <button
          onClick={() => useHunterStore.getState().setView("profile")}
          className="ml-1 flex items-center gap-3"
        >
          <div className="grid size-9 place-items-center border border-blue-300/30 bg-gradient-to-br from-blue-500/30 to-cyan-300/5 system-font text-xs font-bold text-cyan-200">
            AQ
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold">Arin Qamar</p>
            <p className="system-font text-[8px] tracking-widest text-blue-400">NOVICE HUNTER</p>
          </div>
        </button>
      </div>
    </header>
  );
}
