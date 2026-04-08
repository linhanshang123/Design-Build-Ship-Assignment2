"use client";

import Link from "next/link";
import {
  CheckInBadge,
  DayNotesEditor,
  PlannerList,
  SectionCard,
  TimeBlockTimeline,
} from "@/components/planner-cards";
import { usePlanner } from "@/lib/planner-context";
import { useTheme } from "@/lib/theme-context";
import { formatDisplayDate } from "@/lib/planner-utils";

export function DayPageClient({ date, today }: { date: string; today: string }) {
  const { getItemsForDate } = usePlanner();
  const { theme } = useTheme();
  const items = getItemsForDate(date);
  const dayItems = items;
  const timeBlocks = items.filter((item) => item.kind === "time-block");
  const showLiveTimeline = date === today;
  const actionButtonStyle = theme === "moon" ? { color: "#fff4e7" } : undefined;

  return (
    <div className="space-y-6">
      <SectionCard
        title={formatDisplayDate(date)}
        subtitle="A focused view of everything planned for this day."
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CheckInBadge date={date} />
            <Link
              href="/new"
              className="planner-button planner-ui rounded-full px-4 py-2 text-sm"
              style={actionButtonStyle}
            >
              Add another item
            </Link>
          </div>

          <div>
            <p className="mb-3 text-sm text-[var(--muted)]">
              Everything on this day, with priority items shown first. Time-block
              events can also be checked off here.
            </p>
            <PlannerList
              items={dayItems}
              todayDate={today}
              emptyLabel="No items planned for this day yet."
            />
          </div>
        </div>
      </SectionCard>

      {showLiveTimeline ? (
        <SectionCard
          title="Today Timeline"
          subtitle="A live view of today's time blocks using your local browser time."
        >
          <TimeBlockTimeline date={date} items={timeBlocks} />
        </SectionCard>
      ) : null}

      <SectionCard
        title="Daily Notes"
        subtitle="Use this space for constraints, intentions, or a short reflection."
      >
        <DayNotesEditor date={date} />
      </SectionCard>
    </div>
  );
}
