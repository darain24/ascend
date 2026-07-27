import type { Metadata } from "next";
import { AscendApp } from "@/components/ascend-app";

export const metadata: Metadata = {
  title: { absolute: "Ascend — Hunter System" },
  description:
    "Turn your daily discipline into quests, XP, stats, streaks, and rank.",
};

export default function Home() {
  return <AscendApp />;
}
