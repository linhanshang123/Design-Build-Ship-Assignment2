"use client";

import Link from "next/link";
import {
  CheckInBadge,
  SectionCard,
  TimeBlockTimeline,
  useMinuteClock,
} from "@/components/planner-cards";
import { usePlanner } from "@/lib/planner-context";
import {
  formatClockTime,
  formatDisplayDate,
  formatDisplayDateWithYear,
  formatTimeRange,
  getActiveTimeBlock,
  getLaterPriorityTimeBlock,
  getTimeBlockStatus,
  getUpcomingTimeBlocks,
} from "@/lib/planner-utils";
import { useTheme } from "@/lib/theme-context";

function FocusCard({ date }: { date: string }) {
  const { getItemsForDate } = usePlanner();
  const { theme } = useTheme();
  const now = useMinuteClock(date);
  const items = getItemsForDate(date);
  const actionButtonStyle = theme === "moon" ? { color: "#fff4e7" } : undefined;
  const activeBlock = getActiveTimeBlock(items, now);
  const upcomingBlock = getUpcomingTimeBlocks(items, now)[0];
  const laterPriorityEvent = getLaterPriorityTimeBlock(items, now);
  const nextPriorityTask = items.find(
    (item) =>
      item.priority === "priority" &&
      !item.completed &&
      (item.kind !== "time-block" || !item.startTime || !item.endTime),
  );

  const focus = activeBlock
    ? {
        mode: "Now",
        title: activeBlock.title,
        meta: activeBlock.startTime
          ? formatTimeRange(activeBlock.startTime, activeBlock.endTime)
          : "Current focus block",
        detail: getTimeBlockStatus(activeBlock, now).label,
        tone: "bg-[var(--success-soft)] text-[var(--success)]",
      }
    : upcomingBlock
      ? {
          mode: "Next",
          title: upcomingBlock.title,
          meta: upcomingBlock.startTime
            ? formatTimeRange(upcomingBlock.startTime, upcomingBlock.endTime)
            : "Starting soon",
          detail: getTimeBlockStatus(upcomingBlock, now).label,
          tone: "bg-[var(--accent-soft)] text-[var(--accent)]",
        }
      : laterPriorityEvent
        ? {
            mode: "Later Priority Event",
            title: laterPriorityEvent.title,
            meta: laterPriorityEvent.startTime
              ? formatTimeRange(laterPriorityEvent.startTime, laterPriorityEvent.endTime)
              : "Priority event later today",
            detail: getTimeBlockStatus(laterPriorityEvent, now).label,
            tone: "bg-[var(--accent-soft)] text-[var(--accent)]",
          }
        : nextPriorityTask
          ? {
              mode: "Next Priority",
              title: nextPriorityTask.title,
              meta: nextPriorityTask.startTime
                ? formatTimeRange(nextPriorityTask.startTime, nextPriorityTask.endTime)
                : "Priority task for today",
              detail: "Start this next to keep the day moving.",
              tone: "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]",
            }
          : null;

  return (
    <SectionCard
      title="Now / Next"
      subtitle={`A simple command view for ${formatDisplayDate(date)}.`}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Local Time
            </p>
            <p className="mt-2 text-2xl">{formatDisplayDateWithYear(date)}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl" suppressHydrationWarning>
              {formatClockTime(now)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">Live on this device</p>
          </div>
        </div>

        {focus ? (
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] ${focus.tone}`}
              >
                {focus.mode}
              </span>
              <CheckInBadge date={date} />
            </div>
            <h2 className="planner-title mt-5 text-3xl leading-tight">{focus.title}</h2>
            <p className="mt-3 text-base text-[var(--muted)]">{focus.meta}</p>
            <p className="mt-2 text-sm text-[var(--ink)]">{focus.detail}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
              <Link
                href={`/day/${date}`}
                className="planner-button planner-ui rounded-full px-4 py-2"
                style={actionButtonStyle}
              >
                Open full day view
              </Link>
              <Link
                href="/new"
                className="planner-button planner-ui rounded-full px-4 py-2"
                style={actionButtonStyle}
              >
                Add a new item
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-[var(--line)] bg-[var(--surface-strong)] px-5 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="planner-ui rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--ink)]">
                Clear Day
              </span>
              <CheckInBadge date={date} />
            </div>
            <h2 className="planner-title mt-5 text-3xl leading-tight">
              Nothing urgent is scheduled right now.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[var(--muted)]">
              All priority tasks and events are complete. Add a new item if you want to plan more.
            </p>
            <div className="mt-5">
              <Link
                href="/new"
                className="planner-button planner-ui rounded-full px-4 py-2 text-sm"
                style={actionButtonStyle}
              >
                Add the next item
              </Link>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function ProgressStrip({ date }: { date: string }) {
  const { getItemsForDate, isCheckedIn } = usePlanner();
  const items = getItemsForDate(date);
  const priorityItems = items.filter((item) => item.priority === "priority");
  const completedPriority = priorityItems.filter((item) => item.completed).length;
  const timeBlocks = items.filter((item) => item.kind === "time-block").length;
  const uncheckedPriority = priorityItems.filter((item) => !item.completed).length;

  return (
    <SectionCard
      title="Check-in"
      subtitle="A small progress strip so you can see whether the day is under control."
    >
      <div className="space-y-4">
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Status</p>
          <p className="mt-3 text-xl">{isCheckedIn(date) ? "Checked in" : "Still open"}</p>
        </div>
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Priority</p>
          <p className="mt-3 text-xl">
            {completedPriority}/{priorityItems.length} done
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Today</p>
          <p className="mt-3 text-xl">
            {timeBlocks} blocks - {uncheckedPriority} left
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

export function HomePageClient({ today }: { today: string }) {
  const { getItemsForDate } = usePlanner();
  const items = getItemsForDate(today);
  const timeBlocks = items.filter((item) => item.kind === "time-block");

  return (
    <div className="space-y-6">
      <FocusCard date={today} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Today Timeline"
          subtitle="A compact schedule view that supports the main Now / Next card."
        >
          <TimeBlockTimeline date={today} items={timeBlocks} />
        </SectionCard>

        <ProgressStrip date={today} />
      </div>
    </div>
  );
}
