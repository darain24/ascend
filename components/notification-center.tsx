"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  Flag,
  Gift,
  Loader2,
  Target,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useHunterStore } from "@/store/use-hunter-store";

type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  category: "quest" | "challenge" | "milestone" | "reward";
  startsAt: string;
  targetView: "dashboard" | "quests" | "journey" | "analytics" | "profile";
};

type NotificationResponse = {
  profileId: string;
  events: UpcomingEvent[];
};

const icons = {
  quest: Target,
  challenge: Flag,
  milestone: CalendarDays,
  reward: Gift,
};

function formatEventTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const setView = useHunterStore((state) => state.setView);
  const timezoneOffset =
    typeof window === "undefined" ? 0 : new Date().getTimezoneOffset();

  const query = useQuery({
    queryKey: ["upcoming-events", timezoneOffset],
    queryFn: async () => {
      const response = await fetch(
        `/api/notifications?timezoneOffset=${timezoneOffset}`,
      );
      if (!response.ok) throw new Error("Could not load upcoming events");
      return (await response.json()) as NotificationResponse;
    },
    staleTime: 60_000,
  });

  const storageKey = query.data
    ? `ascend.notifications.read.${query.data.profileId}`
    : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      setReadIds(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
    } catch {
      setReadIds([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const unreadCount = useMemo(
    () =>
      query.data?.events.filter((event) => !readIds.includes(event.id)).length ??
      0,
    [query.data, readIds],
  );

  function saveReadIds(ids: string[]) {
    setReadIds(ids);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(ids));
  }

  function openEvent(event: UpcomingEvent) {
    if (!readIds.includes(event.id)) saveReadIds([...readIds, event.id]);
    setView(event.targetView);
    setOpen(false);
  }

  function markAllRead() {
    if (query.data) saveReadIds(query.data.events.map((event) => event.id));
  }

  return (
    <div className="relative">
      <button
        aria-label={`Upcoming events${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-9 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--panel)]"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 min-w-3.5 rounded-full bg-indigo-600 px-1 text-center text-[8px] font-semibold leading-3.5 text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
          <motion.button
            aria-label="Close upcoming events"
            className="fixed inset-0 z-40 cursor-default bg-black/10"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Upcoming events"
            className="fixed inset-x-3 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-[390px]"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-start justify-between border-b border-[var(--line)] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Upcoming events</h2>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Quest deadlines, challenges, and milestones
                </p>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--bg)]"
              >
                <X size={15} />
              </button>
            </header>

            <div className="max-h-[420px] overflow-y-auto p-2">
              {query.isLoading && (
                <div className="grid min-h-48 place-items-center text-[var(--muted)]">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              )}
              {query.isError && (
                <div className="p-8 text-center">
                  <p className="text-xs font-medium">Events could not be loaded</p>
                  <button
                    onClick={() => query.refetch()}
                    className="mt-3 text-[11px] font-medium text-indigo-600"
                  >
                    Try again
                  </button>
                </div>
              )}
              {query.data?.events.length === 0 && (
                <div className="grid min-h-48 place-items-center px-8 text-center">
                  <div>
                    <CalendarDays className="mx-auto text-[var(--muted)]" size={22} />
                    <p className="mt-3 text-xs font-medium">No upcoming events</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
                      Quest deadlines and earned milestones will appear here.
                    </p>
                  </div>
                </div>
              )}
              {query.data?.events.map((event) => {
                const Icon = icons[event.category];
                const isRead = readIds.includes(event.id);
                return (
                  <button
                    key={event.id}
                    onClick={() => openEvent(event)}
                    className="flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-[var(--bg)]"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-medium">{event.title}</p>
                        {!isRead && (
                          <span className="size-1.5 shrink-0 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
                        {event.description}
                      </p>
                      <p className="mt-1.5 text-[9px] font-medium text-indigo-600">
                        {formatEventTime(event.startsAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {query.data && (
              <footer className="border-t border-[var(--line)] p-3">
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:text-[var(--muted)]"
                >
                  <CheckCheck size={14} />
                  {unreadCount ? "Mark all as read" : "All events are read"}
                </button>
              </footer>
            )}
          </motion.section>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
