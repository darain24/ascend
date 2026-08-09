"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialHunter, initialQuests } from "@/lib/initial-data";
import { addQuestCompletion, type ActivityHistory } from "@/lib/activity";
import { rebirthState, type HunterClass } from "@/lib/game-logic/advanced";
import type { HunterState, Quest } from "@/types/game";

type HunterProfile = {
  name: string;
  email: string;
  avatarUrl: string | null;
  githubUsername: string;
  timezone: string;
};

type HunterStore = {
  hunter: HunterState;
  quests: Quest[];
  profile: HunterProfile;
  theme: "dark" | "light";
  sound: boolean;
  activeView: "dashboard" | "quests" | "journey" | "analytics" | "system" | "guild" | "profile" | "settings";
  skillPoints: number;
  unlockedSkills: string[];
  inventory: Record<string, number>;
  activity: ActivityHistory;
  overlay: null | { kind: "quest" | "level" | "rank"; title: string; subtitle: string };
  setView: (view: HunterStore["activeView"]) => void;
  setTheme: (theme: HunterStore["theme"]) => void;
  toggleSound: () => void;
  updateProfile: (profile: Partial<HunterProfile>) => void;
  resetJourney: () => void;
  addQuest: (quest: Quest) => void;
  unlockSkill: (skillId: string, cost: number) => boolean;
  useItem: (itemId: string) => boolean;
  chooseClass: (hunterClass: HunterClass) => boolean;
  rebirth: () => boolean;
  setOverlay: (overlay: HunterStore["overlay"]) => void;
  applyCompletion: (questId: string, next: HunterState) => void;
  replaceServerState: (state: Partial<Pick<HunterStore, "hunter" | "quests" | "profile" | "skillPoints" | "unlockedSkills" | "inventory" | "activity">>) => void;
};

export const useHunterStore = create<HunterStore>()(
  persist((set) => ({
  hunter: initialHunter,
  quests: initialQuests,
  profile: {
    name: "Hunter",
    email: "",
    avatarUrl: null,
    githubUsername: "",
    timezone: "UTC",
  },
  theme: "light",
  sound: true,
  activeView: "dashboard",
  skillPoints: 0,
  unlockedSkills: [],
  inventory: {},
  activity: {},
  overlay: null,
  setView: (activeView) => set({ activeView }),
  setTheme: (theme) => set({ theme }),
  toggleSound: () => set((state) => ({ sound: !state.sound })),
  updateProfile: (profile) =>
    set((state) => ({ profile: { ...state.profile, ...profile } })),
  resetJourney: () =>
    set({
      hunter: { ...initialHunter, stats: { ...initialHunter.stats } },
      quests: [],
      skillPoints: 0,
      unlockedSkills: [],
      inventory: {},
      activity: {},
      activeView: "dashboard",
      overlay: null,
    }),
  addQuest: (quest) => set((state) => ({ quests: [...state.quests, quest] })),
  unlockSkill: (skillId, cost) => {
    let unlocked = false;
    set((state) => {
      if (state.skillPoints < cost || state.unlockedSkills.includes(skillId)) return state;
      unlocked = true;
      return {
        skillPoints: state.skillPoints - cost,
        unlockedSkills: [...state.unlockedSkills, skillId],
      };
    });
    return unlocked;
  },
  useItem: (itemId) => {
    let used = false;
    set((state) => {
      const count = state.inventory[itemId] ?? 0;
      if (count < 1) return state;
      used = true;
      return {
        inventory: { ...state.inventory, [itemId]: count - 1 },
        hunter:
          itemId === "recovery-pass"
            ? { ...state.hunter, discipline: Math.min(100, state.hunter.discipline + 10) }
            : state.hunter,
      };
    });
    return used;
  },
  chooseClass: (hunterClass) => {
    let selected = false;
    set((state) => {
      if (state.hunter.level < 10 || state.hunter.hunterClass) return state;
      selected = true;
      return { hunter: { ...state.hunter, hunterClass } };
    });
    return selected;
  },
  rebirth: () => {
    let completed = false;
    set((state) => {
      if (state.hunter.rank !== "S") return state;
      const next = rebirthState(state.hunter);
      completed = true;
      return {
        hunter: {
          ...state.hunter,
          level: next.level,
          xp: next.currentXp,
          xpToNext: next.xpToNextLevel,
          rank: next.rank,
          rebirthCount: next.rebirthCount,
          globalXpMultiplier: next.globalXpMultiplier,
        },
      };
    });
    return completed;
  },
  setOverlay: (overlay) => set({ overlay }),
  replaceServerState: (serverState) => set(serverState),
  applyCompletion: (questId, hunter) =>
    set((state) => {
      const completedQuest = state.quests.find((quest) => quest.id === questId);
      return {
        hunter,
        quests: state.quests.map((quest) =>
          quest.id === questId ? { ...quest, completed: true } : quest,
        ),
        activity: completedQuest
          ? addQuestCompletion(state.activity, completedQuest.xp, new Date(), completedQuest.stat)
          : state.activity,
      };
    }),
  }), {
    name: "ascend-user-profile",
    partialize: (state) => ({
      hunter: state.hunter,
      quests: state.quests,
      profile: state.profile,
      theme: state.theme,
      sound: state.sound,
      skillPoints: state.skillPoints,
      unlockedSkills: state.unlockedSkills,
      inventory: state.inventory,
      activity: state.activity,
    }),
    version: 4,
    migrate: (persistedState, version) => {
      const persisted = persistedState as Partial<HunterStore>;
      const profile = {
        name: persisted.profile?.name ?? "Hunter",
        email: persisted.profile?.email ?? "",
        avatarUrl: persisted.profile?.avatarUrl ?? null,
        githubUsername: persisted.profile?.githubUsername ?? "",
        timezone: persisted.profile?.timezone ?? "UTC",
      };
      const base = {
        hunter: persisted.hunter ?? initialHunter,
        quests: persisted.quests ?? initialQuests,
        profile,
        theme: persisted.theme ?? "light",
        sound: persisted.sound ?? true,
        skillPoints: persisted.skillPoints ?? 0,
        unlockedSkills: persisted.unlockedSkills ?? [],
        inventory: persisted.inventory ?? {},
        activity: persisted.activity ?? {},
      };
      if (version >= 3) {
        return base;
      }
      if (version === 2) {
        return { ...base, activity: {} };
      }
      return {
        ...base,
        hunter: initialHunter,
        quests: initialQuests,
        profile: persisted.profile?.email === "arin@example.com"
          ? { name: "Hunter", email: "", avatarUrl: null, githubUsername: "", timezone: "UTC" }
          : profile,
        skillPoints: 0,
        unlockedSkills: [],
        inventory: {},
        activity: {},
      };
    },
    skipHydration: true,
  }),
);
