import Link from "next/link";
import { ReactNode } from "react";
import { NavLink } from "@/components/nav-link";
import { getToday } from "@/lib/planner-utils";

export function SiteShell({ children }: { children: ReactNode }) {
  const today = getToday();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_60px_rgba(61,44,32,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                Day Planner
              </span>
            </Link>
            <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">
              Plan the next few days.
              <br />
              Show up for the one you are in.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              A calm dashboard for priority tasks, time blocks, and weekly rhythm.
              Everything lives in memory on purpose.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavLink href="/">Today</NavLink>
            <NavLink href="/new">New Item</NavLink>
            <NavLink href={`/day/${today}`}>Day View</NavLink>
            <NavLink href="/week">Week Overview</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
