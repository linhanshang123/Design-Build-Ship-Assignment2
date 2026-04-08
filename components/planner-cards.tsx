"use client";

import Link from "next/link";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { usePlanner } from "@/lib/planner-context";
import {
  PlannerItem,
  calculateCheckIn,
  formatClockTime,
  formatDateInput,
  formatDisplayDate,
  formatDisplayDateWithYear,
  formatDurationFromMinutes,
  formatTimeRange,
  formatWeekday,
  getActiveTimeBlock,
  getTimeBlockStatus,
  getUpcomingTimeBlocks,
  parseDateInput,
  parseTimeToMinutes,
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
    <section className="planner-panel rounded-[1.75rem] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="planner-title text-xl">{title}</h2>
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
      {checkedIn
        ? "Checked in: all priority work completed."
        : "In progress: finish all priority items to check in."}
    </div>
  );
}

export function PlannerList({
  items,
  emptyLabel,
  todayDate,
}: {
  items: PlannerItem[];
  emptyLabel: string;
  todayDate?: string;
}) {
  const { toggleItem } = usePlanner();
  const now = useMinuteClock(todayDate ?? "2026-01-01");

  if (items.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const liveStatus =
          todayDate && item.kind === "time-block" && item.date === todayDate
            ? item.completed
              ? null
              : getTimeBlockStatus(item, now)
            : null;

        return (
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
                      : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {item.priority}
                </span>
                <span className="planner-ui rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  {item.kind === "time-block" ? "time block" : "task"}
                </span>
              </div>
              {item.startTime ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                  <span>{formatTimeRange(item.startTime, item.endTime)}</span>
                  {item.completed ? (
                    <span className="rounded-full bg-[var(--success-soft)] px-2 py-1 text-xs text-[var(--success)]">
                      Completed
                    </span>
                  ) : liveStatus ? (
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        liveStatus.state === "active"
                          ? "bg-[var(--success-soft)] text-[var(--success)]"
                          : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                      }`}
                    >
                      {liveStatus.label}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}

export function useMinuteClock(baseDate = "2026-01-01") {
  const [now, setNow] = useState(() => {
    const anchor = parseDateInput(baseDate);
    anchor.setHours(12, 0, 0, 0);
    return anchor;
  });

  useEffect(() => {
    const refresh = () => setNow(new Date());
    refresh();
    const delay = Math.max(1000, (60 - new Date().getSeconds()) * 1000);
    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      refresh();
      intervalId = window.setInterval(refresh, 60_000);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return now;
}

type TimedLaneItem = {
  item: PlannerItem;
  lane: number;
  startMinutes: number;
  endMinutes: number;
};

type TimelineOverlay = {
  item: PlannerItem;
  status: ReturnType<typeof getTimeBlockStatus> | null;
  x: number;
  y: number;
};

function buildTimelineLanes(items: PlannerItem[]) {
  const timed = items
    .filter((item) => item.kind === "time-block" && item.startTime && item.endTime)
    .map((item) => ({
      item,
      startMinutes: parseTimeToMinutes(item.startTime!),
      endMinutes: Math.max(
        parseTimeToMinutes(item.startTime!) + 1,
        parseTimeToMinutes(item.endTime!),
      ),
    }))
    .sort((left, right) => left.startMinutes - right.startMinutes);

  const laneEnds: number[] = [];
  const placed: TimedLaneItem[] = [];

  for (const entry of timed) {
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= entry.startMinutes);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(entry.endMinutes);
    } else {
      laneEnds[lane] = entry.endMinutes;
    }

    placed.push({
      item: entry.item,
      lane,
      startMinutes: entry.startMinutes,
      endMinutes: entry.endMinutes,
    });
  }

  return {
    items: placed,
    laneCount: Math.max(1, laneEnds.length),
  };
}

function formatHourLabel(hour: number) {
  if (hour === 0) {
    return "12 AM";
  }
  if (hour < 12) {
    return `${hour} AM`;
  }
  if (hour === 12) {
    return "12 PM";
  }
  return `${hour - 12} PM`;
}

function clampOverlay(left: number, top: number) {
  const width = 320;
  const height = 180;
  const margin = 16;
  const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;

  const nextLeft = Math.min(Math.max(margin, left), viewportWidth - width - margin);
  const nextTop = Math.min(Math.max(margin, top), viewportHeight - height - margin);

  return { left: nextLeft, top: nextTop };
}

export function TimeBlockTimeline({
  date,
  items,
}: {
  date: string;
  items: PlannerItem[];
}) {
  const now = useMinuteClock(date);
  const { items: laneItems, laneCount } = buildTimelineLanes(items);
  const isToday = date === formatDateInput(now);
  const hourMarks = [0, 4, 8, 12, 16, 20, 24];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [overlay, setOverlay] = useState<TimelineOverlay | null>(null);

  if (laneItems.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
        No timed blocks yet. Add one with a start and end time to shape the day.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4">
        <div>
          <p
            className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
            suppressHydrationWarning
          >
            {isToday ? "Live Timeline" : "Schedule"}
          </p>
          <p className="mt-2 text-lg">{formatDisplayDateWithYear(date)}</p>
        </div>
        <div className="text-right">
          <p
            className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
            suppressHydrationWarning
          >
            {isToday ? "Local time" : "Reference"}
          </p>
          <p className="mt-2 text-lg" suppressHydrationWarning>
            {formatClockTime(now)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px] rounded-[1.45rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <div className="grid grid-cols-4 overflow-hidden rounded-[1rem] text-xs uppercase tracking-[0.2em]">
            <div className="timeline-segment timeline-segment-night px-3 py-2">Night</div>
            <div className="timeline-segment timeline-segment-morning px-3 py-2">Morning</div>
            <div className="timeline-segment timeline-segment-afternoon px-3 py-2">Afternoon</div>
            <div className="timeline-segment timeline-segment-evening px-3 py-2">Evening</div>
          </div>

          <div
            className="relative mt-4 rounded-[1rem] border border-[var(--line)] bg-[linear-gradient(90deg,rgba(71,85,105,0.07)_0%,rgba(71,85,105,0.07)_25%,rgba(245,158,11,0.09)_25%,rgba(245,158,11,0.09)_50%,rgba(249,115,22,0.09)_50%,rgba(249,115,22,0.09)_75%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_100%)]"
            style={{ height: `${laneCount * 64 + 28}px` }}
          >
            {hourMarks.map((hour) => (
              <div
                key={hour}
                className="absolute inset-y-0 border-l border-dashed border-[var(--line)]"
                style={{ left: `${(hour / 24) * 100}%` }}
              />
            ))}

            {isToday ? (
              <div
                className="absolute inset-y-0 z-20 w-0.5 bg-[var(--accent)]"
                style={{ left: `${(nowMinutes / 1440) * 100}%` }}
              >
                <div className="absolute -left-3 -top-8 rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
                  Now
                </div>
              </div>
            ) : null}

            {laneItems.map(({ item, lane, startMinutes, endMinutes }) => {
              const status = isToday ? getTimeBlockStatus(item, now) : null;
              const left = (startMinutes / 1440) * 100;
              const width = Math.max(2.5, ((endMinutes - startMinutes) / 1440) * 100);
              const tone =
                item.completed
                  ? "timeline-block-complete"
                  : status?.state === "active"
                    ? "timeline-block-active"
                    : item.priority === "priority"
                      ? "timeline-block-priority"
                      : "timeline-block-secondary";

              const showOverlayForRect = (rect: DOMRect) => {
                const { left: overlayLeft, top: overlayTop } = clampOverlay(
                  rect.left + rect.width / 2 - 160,
                  rect.top - 196,
                );
                setOverlay({
                  item,
                  status,
                  x: overlayLeft,
                  y: overlayTop,
                });
              };

              return (
                <div
                  key={item.id}
                  tabIndex={0}
                  onMouseEnter={(event) =>
                    showOverlayForRect(event.currentTarget.getBoundingClientRect())
                  }
                  onMouseLeave={() => setOverlay(null)}
                  onFocus={(event) =>
                    showOverlayForRect(event.currentTarget.getBoundingClientRect())
                  }
                  onBlur={() => setOverlay(null)}
                  className={`timeline-block absolute z-10 overflow-visible rounded-xl px-3 py-2 shadow-[0_10px_24px_rgba(61,44,32,0.12)] outline-none ${tone}`}
                  style={{
                    left: `${left}%`,
                    top: `${14 + lane * 64}px`,
                    width: `${width}%`,
                    minHeight: "44px",
                  }}
                >
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-[11px] opacity-90">
                    {formatTimeRange(item.startTime!, item.endTime)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-6 text-xs text-[var(--muted)]">
            {hourMarks.slice(0, -1).map((hour) => (
              <div key={hour}>{formatHourLabel(hour)}</div>
            ))}
          </div>
        </div>
      </div>

      {overlay ? (
        <div
          className="pointer-events-none fixed z-[9999] w-80 rounded-[1rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-left text-[var(--ink)] shadow-[0_24px_50px_rgba(29,29,27,0.22)]"
          style={{ left: overlay.x, top: overlay.y }}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Event</p>
          <p className="mt-2 text-base font-semibold leading-tight text-[var(--ink)]">
            {overlay.item.title}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {overlay.item.priority}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {formatTimeRange(overlay.item.startTime!, overlay.item.endTime)}
          </p>
          {overlay.item.completed ? (
            <p className="mt-2 text-sm text-[var(--success)]">Completed</p>
          ) : overlay.status ? (
            <p className="mt-2 text-sm">{overlay.status.label}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3">
        {laneItems.map(({ item }) => {
          const status = isToday ? getTimeBlockStatus(item, now) : null;
          const statusClass =
            item.completed
              ? "bg-[var(--success-soft)] text-[var(--success)]"
              : status?.state === "active"
                ? "bg-[var(--success-soft)] text-[var(--success)]"
              : status?.state === "upcoming"
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]";

          return (
            <div
              key={`${item.id}-legend`}
              className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base">{item.title}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs uppercase tracking-[0.18em] ${
                        item.priority === "priority"
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {formatTimeRange(item.startTime!, item.endTime)} ·{" "}
                    {formatDurationFromMinutes(
                      Math.max(
                        0,
                        parseTimeToMinutes(item.endTime!) - parseTimeToMinutes(item.startTime!),
                      ),
                    )}
                  </p>
                </div>
                {item.completed ? (
                  <span className={`rounded-full px-3 py-2 text-xs ${statusClass}`}>
                    Completed
                  </span>
                ) : status ? (
                  <span className={`rounded-full px-3 py-2 text-xs ${statusClass}`}>
                    {status.label}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RailStatusCard({
  eyebrow,
  item,
  statusLabel,
  progress,
}: {
  eyebrow: string;
  item: PlannerItem;
  statusLabel: string;
  progress: number;
}) {
  return (
    <div className="rounded-[1.45rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="text-lg">{item.title}</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs uppercase tracking-[0.18em] ${
            item.priority === "priority"
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
          }`}
        >
          {item.priority}
        </span>
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {item.startTime ? formatTimeRange(item.startTime, item.endTime) : "Time not set"}
      </p>
      <p className="mt-3 text-sm text-[var(--ink)]">{statusLabel}</p>
      <div className="mt-4 h-2 rounded-full bg-[var(--surface)]">
        <div
          className={`h-2 rounded-full transition-[width] ${
            eyebrow === "Now" ? "bg-[var(--success)]" : "bg-[var(--accent)]"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function LiveTimeRail({
  date,
  items,
  children,
}: {
  date: string;
  items: PlannerItem[];
  children?: ReactNode;
}) {
  const now = useMinuteClock(date);
  const isToday = date === formatDateInput(now);
  const active = isToday ? getActiveTimeBlock(items, now) : undefined;
  const upcoming = isToday
    ? getUpcomingTimeBlocks(items, now).filter((item) => item.id !== active?.id)
    : [];

  return (
    <div className="space-y-6 xl:sticky xl:top-6">
      <section className="planner-panel rounded-[1.75rem] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Local Time
            </p>
            <p className="mt-2 text-xl">{formatDisplayDateWithYear(date)}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl" suppressHydrationWarning>
              {formatClockTime(now)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isToday ? "Live on this device" : "Reference only"}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {active ? (
            <RailStatusCard
              eyebrow="Now"
              item={active}
              statusLabel={getTimeBlockStatus(active, now).label}
              progress={getTimeBlockStatus(active, now).progress}
            />
          ) : (
            <div className="rounded-[1.35rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
              No active time block right now.
            </div>
          )}

          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Upcoming Soon
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Blocks that start within the next hour move here automatically.
              </p>
            </div>

            {upcoming.length > 0 ? (
              upcoming.map((item) => {
                const status = getTimeBlockStatus(item, now);
                return (
                  <RailStatusCard
                    key={item.id}
                    eyebrow="Upcoming"
                    item={item}
                    statusLabel={status.label}
                    progress={0}
                  />
                );
              })
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
                Nothing starts within the next hour.
              </div>
            )}
          </div>
        </div>
      </section>

      {children}
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
      className="planner-field w-full rounded-[1.25rem] px-4 py-3 text-sm leading-6 outline-none"
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
                  : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
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
      className="planner-field w-full rounded-[1.25rem] px-4 py-3 text-sm leading-6 outline-none"
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
