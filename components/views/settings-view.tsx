"use client";

import { Bell, Download, Globe2, LogOut, Moon, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut as signOutSession } from "next-auth/react";
import { useState } from "react";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { useHunterStore } from "@/store/use-hunter-store";

export function SettingsView() {
  const router = useRouter();
  const profile = useHunterStore((state) => state.profile);
  const theme = useHunterStore((state) => state.theme);
  const setTheme = useHunterStore((state) => state.setTheme);
  const updateProfile = useHunterStore((state) => state.updateProfile);
  const [pushNotice, setPushNotice] = useState("");
  const [timezoneNotice, setTimezoneNotice] = useState("");

  async function download(format: "json" | "csv") {
    const response = await fetch(`/api/export?format=${format}`);
    if (!response.ok) return;
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ascend-export.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function enablePush() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey || !("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushNotice("Push notifications are not supported in this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setPushNotice("Notification permission was not granted.");
      return;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
      const raw = atob((publicKey + padding).replace(/-/g, "+").replace(/_/g, "/"));
      const applicationServerKey = Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error("Subscription could not be saved.");
      setPushNotice("Notifications enabled and synced to this account.");
    } catch (error) {
      setPushNotice(error instanceof Error ? error.message : "Push notifications could not be enabled.");
    }
  }

  async function signOut() {
    await signOutSession({ redirect: false });
    router.push("/signin");
    router.refresh();
  }

  async function useDeviceTimezone() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezoneNotice("");
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ timezone }),
    });
    const result = (await response.json()) as { profile?: typeof profile; error?: string };
    if (!response.ok || !result.profile) {
      setTimezoneNotice(result.error || "Timezone could not be updated.");
      return;
    }
    updateProfile(result.profile);
    setTimezoneNotice(`Daily progress now follows ${timezone}.`);
  }

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Settings</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Manage your account and app preferences.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="system-panel p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">App preferences</h2>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]">Choose how Ascend looks on this device.</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[var(--line)] p-4">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-[var(--muted)]" />
              <div>
                <p className="text-xs font-medium">Theme</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">Switch between light and dark.</p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium"
            >
              {theme === "light" ? "Use dark" : "Use light"}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--line)] p-4">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-[var(--muted)]" />
              <div><p className="text-xs font-medium">Push reminders</p><p className="mt-0.5 text-[10px] text-[var(--muted)]">Daily quests and penalty warnings.</p></div>
            </div>
            <button onClick={enablePush} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium">Enable</button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Globe2 size={16} className="shrink-0 text-[var(--muted)]" />
              <div className="min-w-0"><p className="text-xs font-medium">Daily timezone</p><p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">{profile.timezone}</p></div>
            </div>
            <button onClick={useDeviceTimezone} className="shrink-0 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium">Use device</button>
          </div>
          {timezoneNotice && <p className="mt-2 text-[10px] text-[var(--muted)]">{timezoneNotice}</p>}
          {pushNotice && <p className="mt-2 text-[10px] text-[var(--muted)]">{pushNotice}</p>}
          <div className="mt-3 rounded-xl border border-[var(--line)] p-4">
            <div className="flex items-center gap-3"><Download size={16} className="text-[var(--muted)]" /><div><p className="text-xs font-medium">Export your data</p><p className="mt-0.5 text-[10px] text-[var(--muted)]">Download progress without sending it elsewhere.</p></div></div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => download("json")} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium">JSON</button>
              <button onClick={() => download("csv")} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium">CSV</button>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </section>

        <section className="system-panel p-5 sm:p-6">
          <ChangePasswordForm name={profile.name} email={profile.email} />
        </section>
      </div>
    </>
  );
}
