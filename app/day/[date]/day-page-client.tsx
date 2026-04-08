"use client";

import Link from "next/link";
import {
  CheckInBadge,
  DayNotesEditor,
  PlannerList,
  SectionCard,
} from "@/components/planner-cards";
import { usePlanner } from "@/lib/planner-context";
import { formatDisplayDate } from "@/lib/planner-utils";

export function DayPageClient({ date }: { date: string }) {
  const { getItemsForDate } = usePlanner();
  const items = getItemsForDate(date);
  const priorityItems = items.filter((item) => item.priority === "priority");
  const secondaryItems = items.filter((item) => item.priority === "secondary");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <div className="space-y-6">
        <SectionCard
          title={formatDisplayDate(date)}
          subtitle="A focused view of everything planned for this day."
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CheckInBadge date={date} />
            <Link
              href="/new"
              className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm hover:border-[var(--accent)]"
            >
              Add another item
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          title="Priority Items"
          subtitle="Complete all of these to mark the day as checked in."
        >
          <PlannerList
            items={priorityItems}
            emptyLabel="No priority items planned for this day yet."
          />
        </SectionCard>

        <SectionCard
          title="Secondary Items"
          subtitle="Useful work, errands, and lighter tasks."
        >
          <PlannerList
            items={secondaryItems}
            emptyLabel="No secondary items planned for this day yet."
          />
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Daily Notes"
          subtitle="Use this space for constraints, intentions, or a short reflection."
        >
          <DayNotesEditor date={date} />
        </SectionCard>
      </div>
    </div>
  );
}
