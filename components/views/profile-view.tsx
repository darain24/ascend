"use client";

import {
  Camera,
  Check,
  KeyRound,
  LockKeyhole,
  Medal,
  Settings2,
  Sparkles,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { StatCard } from "../stat-card";
import { useHunterStore } from "@/store/use-hunter-store";
import type { StatKey } from "@/lib/game-logic/constants";

const CREDENTIALS_KEY = "ascend.local-password";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const achievements = [
  { title: "First step", detail: "Completed your first quest", icon: Sparkles, unlocked: true, color: "bg-indigo-50 text-indigo-600" },
  { title: "One full week", detail: "Maintained a 7-day streak", icon: Medal, unlocked: true, color: "bg-emerald-50 text-emerald-600" },
  { title: "One hundred", detail: "Completed 100 quests", icon: Trophy, unlocked: true, color: "bg-amber-50 text-amber-600" },
  { title: "Rank C", detail: "Reach Hunter Rank C", icon: Medal, unlocked: false, color: "bg-blue-50 text-blue-600" },
];

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = window.atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function derivePasswordHash(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: 120_000,
    },
    passwordKey,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

export function ProfileView() {
  const hunter = useHunterStore((state) => state.hunter);
  const profile = useHunterStore((state) => state.profile);
  const updateProfile = useHunterStore((state) => state.updateProfile);
  const sound = useHunterStore((state) => state.sound);
  const toggleSound = useHunterStore((state) => state.toggleSound);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setHasPassword(Boolean(localStorage.getItem(CREDENTIALS_KEY)));
  }, []);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
  }, [profile.email, profile.name]);

  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError("");
    setProfileNotice("");
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) {
      setProfileError("Please enter a name with at least two characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setProfileError("Please enter a valid email address.");
      return;
    }
    updateProfile({ name: cleanName, email: cleanEmail });
    setProfileNotice("Profile details updated.");
  }

  function chooseAvatar() {
    avatarInputRef.current?.click();
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setAvatarError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("The image must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateProfile({ avatarUrl: reader.result });
        setProfileNotice("Profile photo updated.");
      }
    };
    reader.onerror = () => setAvatarError("The selected image could not be read.");
    reader.readAsDataURL(file);
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordNotice("");
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError("Use at least 8 characters with a letter and a number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const storedValue = localStorage.getItem(CREDENTIALS_KEY);
      if (storedValue) {
        const stored = JSON.parse(storedValue) as { salt: string; hash: string };
        const currentHash = await derivePasswordHash(
          currentPassword,
          base64ToBytes(stored.salt),
        );
        if (currentHash !== stored.hash) {
          setPasswordError("The current password is incorrect.");
          return;
        }
      }

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const hash = await derivePasswordHash(newPassword, salt);
      localStorage.setItem(
        CREDENTIALS_KEY,
        JSON.stringify({ salt: bytesToBase64(salt), hash }),
      );
      setHasPassword(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice(storedValue ? "Password changed." : "Password created.");
    } catch {
      setPasswordError("The password could not be updated. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Profile</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Your identity, achievements, and preferences.</p>
      </div>

      <section className="system-panel p-5 sm:p-7">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div>
            <button
              type="button"
              aria-label="Change profile photo"
              onClick={chooseAvatar}
              className="group relative block size-24 overflow-hidden rounded-full bg-[#dbe5dc] text-2xl font-semibold text-[#395442] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={`${profile.name}'s profile`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="grid size-full place-items-center">{initials}</span>
              )}
              <span className="absolute inset-0 grid place-items-center bg-black/0 text-transparent transition group-hover:bg-black/35 group-hover:text-white group-focus-visible:bg-black/35 group-focus-visible:text-white">
                <Camera size={20} />
              </span>
              <span className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border-2 border-white bg-slate-900 text-white">
                <Camera size={13} />
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">{profile.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{profile.email}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Novice Hunter · Level {hunter.level}</p>
            <span className="mt-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">Rank {hunter.rank}</span>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-3xl font-semibold">{hunter.totalCompleted}</p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">quests completed</p>
          </div>
        </div>
        {avatarError && <p className="mt-4 text-center text-xs text-rose-600 sm:text-left">{avatarError}</p>}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <h2 className="text-sm font-semibold">Account details</h2>
            <p className="mt-1 text-[11px] text-[var(--muted)]">Update the name and email shown on your profile.</p>
            <form className="mt-5 space-y-4" onSubmit={saveProfile}>
              <label className="block">
                <span className="mb-2 block text-xs font-medium">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              {profileError && <p className="text-xs text-rose-600">{profileError}</p>}
              {profileNotice && <p className="text-xs text-emerald-600">{profileNotice}</p>}
              <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white">Save changes</button>
            </form>
          </section>

          <section className="system-panel p-5 sm:p-6">
            <h2 className="text-sm font-semibold">Achievements</h2>
            <p className="mt-1 text-[11px] text-[var(--muted)]">3 of 18 unlocked</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {achievements.map(({ title, detail, icon: Icon, unlocked, color }) => (
                <div key={title} className={`relative rounded-2xl border border-[var(--line)] p-4 ${unlocked ? "" : "opacity-45"}`}>
                  <div className={`mb-4 grid size-9 place-items-center rounded-xl ${unlocked ? color : "bg-slate-100 text-slate-400"}`}>
                    {unlocked ? <Icon size={16} /> : <LockKeyhole size={14} />}
                  </div>
                  <h3 className="text-xs font-medium">{title}</h3>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">{detail}</p>
                  {unlocked && <Check className="absolute right-4 top-4 text-emerald-600" size={13} />}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><KeyRound size={16} /></div>
              <div>
                <h2 className="text-sm font-semibold">{hasPassword ? "Change password" : "Create password"}</h2>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">For this local browser profile</p>
              </div>
            </div>
            <form className="mt-5 space-y-4" onSubmit={savePassword}>
              {hasPassword && (
                <label className="block">
                  <span className="mb-2 block text-xs font-medium">Current password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-xs font-medium">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium">Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              {passwordError && <p className="text-xs text-rose-600">{passwordError}</p>}
              {passwordNotice && <p className="text-xs text-emerald-600">{passwordNotice}</p>}
              <button disabled={savingPassword} className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-medium text-white disabled:opacity-60">
                {savingPassword ? "Saving…" : hasPassword ? "Change password" : "Create password"}
              </button>
            </form>
            <p className="mt-4 text-[9px] leading-relaxed text-[var(--muted)]">
              This demo uses a PBKDF2 hash stored for this browser profile. Connect production authentication for cross-device login and account recovery.
            </p>
          </section>

          <section className="system-panel p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><Settings2 size={16} /></div>
              <h2 className="text-sm font-semibold">Preferences</h2>
            </div>
            <div className="mt-5 space-y-1">
              {[["Time zone", "Asia / Kolkata"], ["Daily reset", "12:00 AM"], ["Sound effects", sound ? "On" : "Off"], ["Theme", "Light"]].map(([label, value]) => (
                <button key={label} onClick={label === "Sound effects" ? toggleSound : undefined} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs transition hover:bg-[var(--bg)]">
                  <span className="text-[var(--muted)]">{label}</span>
                  <span className="font-medium">{value}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(Object.keys(hunter.stats) as StatKey[]).map((stat) => (
          <StatCard key={stat} stat={stat} value={hunter.stats[stat]} />
        ))}
      </div>
    </>
  );
}
