"use client";

import { ReflectionEditor, SectionCard, WeekStrip } from "@/components/planner-cards";
import { usePlanner } from "@/lib/planner-context";
import {
  formatDisplayDate,
  getPreviousWeekStart,
  getToday,
  getWeekDates,
} from "@/lib/planner-utils";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl">{value}</p>
    </div>
  );
}

export default function WeekPage() {
  const today = getToday();
  const currentWeekDates = getWeekDates(today);
  const previousWeekStart = getPreviousWeekStart(today);
  const { getWeekSummary } = usePlanner();
  const summary = getWeekSummary(previousWeekStart);

  return (
    <div className="space-y-6">
      <SectionCard
        title="This Week"
        subtitle="A seven-day strip for what is coming next and where the load sits."
      >
        <WeekStrip dates={currentWeekDates} />
      </SectionCard>

      <SectionCard
        title="Last Week Summary"
        subtitle={`Automatic stats and a short reflection for the week starting ${formatDisplayDate(previousWeekStart)}.`}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Planned items" value={summary.plannedCount} />
          <StatCard label="Completed items" value={summary.completedCount} />
          <StatCard label="Checked-in days" value={summary.checkedInDays} />
          <StatCard label="Priority completion" value={`${summary.priorityRate}%`} />
        </div>
        <div className="mt-5">
          <ReflectionEditor weekStart={previousWeekStart} />
        </div>
      </SectionCard>
    </div>
  );
}
