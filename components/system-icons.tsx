import type { LucideIcon } from "lucide-react";
import { Brain, Dumbbell, Eye, HeartPulse, Wind } from "lucide-react";
import type { StatKey } from "@/lib/game-logic/constants";

export const statIcons: Record<StatKey, LucideIcon> = {
  STR: Dumbbell,
  VIT: HeartPulse,
  INT: Brain,
  AGI: Wind,
  PER: Eye,
};

export const statColors: Record<StatKey, string> = {
  STR: "#ff6b75",
  VIT: "#45efae",
  INT: "#4da6ff",
  AGI: "#b174ff",
  PER: "#ffd166",
};
