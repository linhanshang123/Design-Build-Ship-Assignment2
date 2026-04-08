"use client";

import Link from "next/link";
import {
  CheckInBadge,
  DayNotesEditor,
  PlannerList,
  SectionCard,
  UpcomingDays,
} from "@/components/planner-cards";
import { usePlanner } from "@/lib/planner-context";
import { formatDisplayDate, getToday } from "@/lib/planner-utils";

export default function HomePage() {
  const today = getToday();
  const { getItemsForDate } = usePlanner();
  const items = getItemsForDate(today);
  const priorityItems = items.filter((item) => item.priority === "priority");
  const secondaryItems = items.filter((item) => item.priority === "secondary");
  const timeBlocks = items.filter((item) => item.kind === "time-block");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <div className="space-y-6">
        <SectionCard
          title="Today"
          subtitle={`Your operating view for ${formatDisplayDate(today)}.`}
        >
          <div className="flex flex-col gap-4">
            <CheckInBadge date={today} />
            <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
              <Link
                href="/new"
                className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 hover:border-[var(--accent)]"
              >
                Add a new item
              </Link>
              <Link
                href={`/day/${today}`}
                className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 hover:border-[var(--accent)]"
              >
                Open full day view
              </Link>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Priority Work"
            subtitle="These items decide whether today counts as a full check-in."
          >
            <PlannerList
              items={priorityItems}
              emptyLabel="No priority items yet. Add one to define the day."
            />
          </SectionCard>

          <SectionCard
            title="Time Blocks"
            subtitle="Protected hours for focused work, errands, or routines."
          >
            <PlannerList
              items={timeBlocks}
              emptyLabel="No time blocks planned yet. Add one from the new-item page."
            />
          </SectionCard>
        </div>

        <SectionCard
          title="Secondary Items"
          subtitle="Useful tasks that should not steal the shape of the day."
        >
          <PlannerList
            items={secondaryItems}
            emptyLabel="No secondary items yet. Keep this list light."
          />
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Day Notes"
          subtitle="A lightweight journal for context, reminders, and constraints."
        >
          <DayNotesEditor date={today} />
        </SectionCard>

        <SectionCard
          title="Coming Up"
          subtitle="Jump ahead to the next few planned days."
        >
          <UpcomingDays />
        </SectionCard>
      </div>
    </div>
  );
}
