"use client";

import { Bell, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useHunterStore } from "@/store/use-hunter-store";

export function Topbar() {
  const [currentDate, setCurrentDate] = useState("");
  const theme = useHunterStore((state) => state.theme);
  const setTheme = useHunterStore((state) => state.setTheme);
  const sound = useHunterStore((state) => state.sound);
  const toggleSound = useHunterStore((state) => state.toggleSound);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const updateDate = () => setCurrentDate(formatter.format(new Date()));

    updateDate();
    const intervalId = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/90 px-4 backdrop-blur-xl sm:px-7">
      <div>
        <p className="text-sm font-medium">{currentDate || "Today"}</p>
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">A fresh day to make progress</p>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label={sound ? "Mute sound" : "Enable sound"} onClick={toggleSound} className="grid size-9 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]">
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid size-9 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button aria-label="Notifications" className="grid size-9 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--panel)]">
          <Bell size={16} />
        </button>
        <button onClick={() => useHunterStore.getState().setView("profile")} className="ml-1 grid size-9 place-items-center rounded-full bg-[#dbe5dc] text-xs font-semibold text-[#395442]">
          AQ
        </button>
      </div>
    </header>
  );
}
