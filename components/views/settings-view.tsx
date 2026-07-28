"use client";

import { LogOut, Moon, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { signOutLocalAccount } from "@/lib/local-auth";
import { useHunterStore } from "@/store/use-hunter-store";

export function SettingsView() {
  const router = useRouter();
  const profile = useHunterStore((state) => state.profile);
  const theme = useHunterStore((state) => state.theme);
  const setTheme = useHunterStore((state) => state.setTheme);

  function signOut() {
    signOutLocalAccount();
    router.push("/signin");
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
