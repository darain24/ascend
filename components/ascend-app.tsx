"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Providers } from "./providers";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Dashboard } from "./views/dashboard";
import { QuestsView } from "./views/quests-view";
import { AnalyticsView } from "./views/analytics-view";
import { JourneyView } from "./views/journey-view";
import { ProfileView } from "./views/profile-view";
import { SystemNotification } from "./system-notification";
import { useHunterStore } from "@/store/use-hunter-store";

function Shell() {
  const activeView = useHunterStore((state) => state.activeView);
  const theme = useHunterStore((state) => state.theme);

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
    profile: <ProfileView />,
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <div className="relative min-h-screen pb-24 md:ml-[88px] md:pb-0 xl:ml-[232px]">
        <Topbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-[1540px] px-4 pb-10 pt-5 sm:px-6 lg:px-8"
          >
            {views[activeView]}
          </motion.div>
        </AnimatePresence>
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
