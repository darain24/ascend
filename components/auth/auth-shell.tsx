import { TrendingUp } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-10 text-[var(--text)]">
      <div className="w-full max-w-[430px]">
        <Link
          href="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2.5 text-base font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <TrendingUp size={18} strokeWidth={2.2} />
          </span>
          Ascend
        </Link>
        <section className="system-panel p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          {children}
        </section>
        <p className="mt-5 text-center text-[10px] text-[var(--muted)]"><Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link><span className="mx-2">·</span><Link href="/terms" className="hover:text-[var(--text)]">Terms</Link></p>
      </div>
    </main>
  );
}
