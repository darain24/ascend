"use client";

import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useHunterStore } from "@/store/use-hunter-store";
import { NotificationCenter } from "./notification-center";

export function Topbar() {
  const [currentDate, setCurrentDate] = useState("");
  const theme = useHunterStore((state) => state.theme);
  const profile = useHunterStore((state) => state.profile);
  const setTheme = useHunterStore((state) => state.setTheme);

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
        <button aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid size-9 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <NotificationCenter />
        <button
          aria-label={`Open ${profile.name}'s profile`}
          onClick={() => useHunterStore.getState().setView("profile")}
          className="relative ml-1 grid size-9 overflow-hidden rounded-full bg-[#dbe5dc] text-xs font-semibold text-[#395442]"
        >
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            profile.name
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          )}
        </button>
      </div>
    </header>
  );
}
