"use client";

import Link from "next/link";
import { ChangeEvent, ReactNode } from "react";
import { usePlanner } from "@/lib/planner-context";
import {
  PlannerItem,
  calculateCheckIn,
  formatDateInput,
  formatDisplayDate,
  formatWeekday,
  parseDateInput,
} from "@/lib/planner-utils";

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_12px_40px_rgba(61,44,32,0.05)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function CheckInBadge({ date }: { date: string }) {
  const { isCheckedIn, getItemsForDate } = usePlanner();
  const items = getItemsForDate(date);
  const checkedIn = isCheckedIn(date);
  const priorityItems = items.filter((item) => item.priority === "priority");

  if (priorityItems.length === 0) {
    return (
      <div className="rounded-full bg-[var(--warning-soft)] px-4 py-2 text-sm text-[var(--warning)]">
        Add a priority item to unlock today&apos;s check-in.
      </div>
    );
  }

  return (
    <div
      className={`rounded-full px-4 py-2 text-sm ${
        checkedIn
          ? "bg-[var(--success-soft)] text-[var(--success)]"
          : "bg-[var(--accent-soft)] text-[var(--accent)]"
      }`}
    >
      {checkedIn ? "Checked in: all priority work completed." : "In progress: finish all priority items to check in."}
    </div>
  );
}

export function PlannerList({
  items,
  emptyLabel,
}: {
  items: PlannerItem[];
  emptyLabel: string;
}) {
  const { toggleItem } = usePlanner();

  if (items.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <label
          key={item.id}
          className={`flex cursor-pointer items-start gap-3 rounded-[1.25rem] border px-4 py-4 transition ${
            item.completed
              ? "border-[var(--success-soft)] bg-[var(--success-soft)]/50"
              : "border-[var(--line)] bg-[var(--surface-strong)]"
          }`}
        >
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => toggleItem(item.id)}
            className="mt-1 h-4 w-4 accent-[var(--success)]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-base ${
                  item.completed ? "text-[var(--muted)] line-through" : "text-[var(--ink)]"
                }`}
              >
                {item.title}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs uppercase tracking-[0.18em] ${
                  item.priority === "priority"
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {item.priority}
              </span>
              <span className="rounded-full bg-white/80 px-2 py-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {item.kind === "time-block" ? "time block" : "task"}
              </span>
            </div>
            {item.startTime ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {item.startTime}
                {item.endTime ? ` - ${item.endTime}` : ""}
              </p>
            ) : null}
          </div>
        </label>
      ))}
    </div>
  );
}

export function DayNotesEditor({ date }: { date: string }) {
  const { getDayNote, updateDayNote } = usePlanner();

  return (
    <textarea
      value={getDayNote(date)}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
        updateDayNote(date, event.target.value)
      }
      rows={5}
      placeholder="Write a quick note for the day: constraints, mindset, reminders."
      className="w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--accent)]"
    />
  );
}

export function WeekStrip({ dates }: { dates: string[] }) {
  const { getItemsForDate } = usePlanner();

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      {dates.map((date) => {
        const items = getItemsForDate(date);
        const checkedIn = calculateCheckIn(items);
        const priorityCount = items.filter((item) => item.priority === "priority").length;
        const completed = items.filter((item) => item.completed).length;

        return (
          <Link
            key={date}
            href={`/day/${date}`}
            className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {formatWeekday(date)}
            </p>
            <p className="mt-2 text-lg">{parseDateInput(date).getDate()}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {items.length} planned / {completed} done
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{priorityCount} priority items</p>
            <div
              className={`mt-4 rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] ${
                checkedIn
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {checkedIn ? "Checked in" : "Open"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function ReflectionEditor({ weekStart }: { weekStart: string }) {
  const { getWeeklyReflection, updateWeeklyReflection } = usePlanner();

  return (
    <textarea
      value={getWeeklyReflection(weekStart)}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
        updateWeeklyReflection(weekStart, event.target.value)
      }
      rows={6}
      placeholder="What helped? What slipped? What should next week feel like?"
      className="w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--accent)]"
    />
  );
}

export function UpcomingDays() {
  const { items } = usePlanner();
  const today = formatDateInput(new Date());
  const upcomingDates = Array.from(new Set(items.map((item) => item.date)))
    .filter((date) => date >= today)
    .sort()
    .slice(0, 4);

  if (upcomingDates.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
        Nothing planned yet. Add a few future-day items to build momentum.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingDates.map((date) => {
        const dayItems = items.filter((item) => item.date === date);
        return (
          <Link
            key={date}
            href={`/day/${date}`}
            className="flex items-center justify-between rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4 transition hover:border-[var(--accent)]"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                {formatWeekday(date)}
              </p>
              <p className="mt-1 text-base">{formatDisplayDate(date)}</p>
            </div>
            <p className="text-sm text-[var(--muted)]">{dayItems.length} items</p>
          </Link>
        );
      })}
    </div>
  );
}
