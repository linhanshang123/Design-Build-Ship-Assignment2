"use client";

import { useState } from "react";
import { ReflectionEditor, SectionCard, WeekStrip } from "@/components/planner-cards";
import { usePlanner } from "@/lib/planner-context";
import { addWeeks, formatDisplayDate, getWeekDates, startOfWeek } from "@/lib/planner-utils";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
      <p className="planner-ui text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl">{value}</p>
    </div>
  );
}

export function WeekPageClient({ today }: { today: string }) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => startOfWeek(today));
  const currentWeekDates = getWeekDates(selectedWeekStart);
  const { getWeekSummary } = usePlanner();
  const summary = getWeekSummary(selectedWeekStart);

  return (
    <div className="space-y-6">
      <SectionCard
        title="This Week"
        subtitle={`A seven-day strip for the week starting ${formatDisplayDate(selectedWeekStart)}.`}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedWeekStart((current) => addWeeks(current, -1))}
            className="planner-button planner-ui rounded-full px-4 py-2 text-sm"
          >
            Last week
          </button>
          <button
            type="button"
            onClick={() => setSelectedWeekStart(startOfWeek(today))}
            className="planner-button planner-ui rounded-full px-4 py-2 text-sm"
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => setSelectedWeekStart((current) => addWeeks(current, 1))}
            className="planner-button planner-ui rounded-full px-4 py-2 text-sm"
          >
            Next week
          </button>
        </div>
        <WeekStrip dates={currentWeekDates} />
      </SectionCard>

      <SectionCard
        title="Week Summary"
        subtitle={`Automatic stats and a short reflection for the week starting ${formatDisplayDate(selectedWeekStart)}.`}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Planned items" value={summary.plannedCount} />
          <StatCard label="Completed items" value={summary.completedCount} />
          <StatCard label="Checked-in days" value={summary.checkedInDays} />
          <StatCard label="Priority completion" value={`${summary.priorityRate}%`} />
        </div>
        <div className="mt-5">
          <ReflectionEditor weekStart={selectedWeekStart} />
        </div>
      </SectionCard>
    </div>
  );
}
