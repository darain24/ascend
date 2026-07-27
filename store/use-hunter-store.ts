"use client";

import { create } from "zustand";
import { initialHunter, initialQuests } from "@/lib/demo-data";
import type { HunterState, Quest } from "@/types/game";

type HunterStore = {
  hunter: HunterState;
  quests: Quest[];
  theme: "dark" | "light";
  sound: boolean;
  activeView: "dashboard" | "quests" | "analytics" | "profile";
  overlay: null | { kind: "quest" | "level" | "rank"; title: string; subtitle: string };
  setView: (view: HunterStore["activeView"]) => void;
  setTheme: (theme: HunterStore["theme"]) => void;
  toggleSound: () => void;
  addQuest: (quest: Quest) => void;
  setOverlay: (overlay: HunterStore["overlay"]) => void;
  applyCompletion: (questId: string, next: HunterState) => void;
};

export const useHunterStore = create<HunterStore>((set) => ({
  hunter: initialHunter,
  quests: initialQuests,
  theme: "light",
  sound: true,
  activeView: "dashboard",
  overlay: null,
  setView: (activeView) => set({ activeView }),
  setTheme: (theme) => set({ theme }),
  toggleSound: () => set((state) => ({ sound: !state.sound })),
  addQuest: (quest) => set((state) => ({ quests: [...state.quests, quest] })),
  setOverlay: (overlay) => set({ overlay }),
  applyCompletion: (questId, hunter) =>
    set((state) => ({
      hunter,
      quests: state.quests.map((quest) =>
        quest.id === questId ? { ...quest, completed: true } : quest,
      ),
    })),
}));
