"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Providers } from "./providers";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Dashboard } from "./views/dashboard";
import { QuestsView } from "./views/quests-view";
import { AnalyticsView } from "./views/analytics-view";
import { JourneyView } from "./views/journey-view";
import { ProfileView } from "./views/profile-view";
import { SettingsView } from "./views/settings-view";
import { SystemView } from "./views/system-view";
import { GuildView } from "./views/guild-view";
import { SystemNotification } from "./system-notification";
import { useHunterStore } from "@/store/use-hunter-store";

function Shell() {
  const activeView = useHunterStore((state) => state.activeView);
  const theme = useHunterStore((state) => state.theme);

  useEffect(() => {
    void useHunterStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  const views = {
    dashboard: <Dashboard />,
    quests: <QuestsView />,
    journey: <JourneyView />,
    analytics: <AnalyticsView />,
    system: <SystemView />,
    guild: <GuildView />,
    profile: <ProfileView />,
    settings: <SettingsView />,
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <div className="relative min-h-screen pb-24 md:ml-[88px] md:pb-0 xl:ml-[232px]">
        <Topbar />
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 12, scale: 0.995 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="view-enter mx-auto max-w-[1540px] px-4 pb-10 pt-5 sm:px-6 lg:px-8"
        >
          {views[activeView]}
        </motion.div>
      </div>
      <SystemNotification />
    </main>
  );
}

export function AscendApp() {
  return (
    <Providers>
      <Shell />
    </Providers>
  );
}
