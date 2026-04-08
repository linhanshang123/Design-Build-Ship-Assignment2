"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/planner-cards";
import { usePlanner } from "@/lib/planner-context";
import { addDays } from "@/lib/planner-utils";

export function NewPageClient({ today }: { today: string }) {
  const router = useRouter();
  const { addItem } = usePlanner();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [kind, setKind] = useState<"task" | "time-block">("task");
  const [priority, setPriority] = useState<"priority" | "secondary">("priority");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  return (
    <div className="mx-auto max-w-3xl">
      <SectionCard
        title="Add a Planner Item"
        subtitle="Plan a future day, protect focus with time blocks, and decide what actually counts."
      >
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) {
              return;
            }

            addItem({
              title: title.trim(),
              date,
              kind,
              priority,
              startTime: kind === "time-block" ? startTime || undefined : undefined,
              endTime: kind === "time-block" ? endTime || undefined : undefined,
            });
            router.push(`/day/${date}`);
          }}
        >
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm text-[var(--muted)]">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Draft studio notes or library deep work"
              className="planner-field w-full rounded-[1.25rem] px-4 py-3 outline-none"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm text-[var(--muted)]">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                min={today}
                onChange={(event) => setDate(event.target.value)}
                className="planner-field w-full rounded-[1.25rem] px-4 py-3 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="kind" className="text-sm text-[var(--muted)]">
                Type
              </label>
              <select
                id="kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as "task" | "time-block")}
                className="planner-field w-full rounded-[1.25rem] px-4 py-3 outline-none"
              >
                <option value="task">Task</option>
                <option value="time-block">Time block</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm text-[var(--muted)]">
              Priority level
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as "priority" | "secondary")
              }
              className="planner-field w-full rounded-[1.25rem] px-4 py-3 outline-none"
            >
              <option value="priority">Priority</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>

          {kind === "time-block" ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm text-[var(--muted)]">
                  Start time
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="planner-field w-full rounded-[1.25rem] px-4 py-3 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm text-[var(--muted)]">
                  End time
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="planner-field w-full rounded-[1.25rem] px-4 py-3 outline-none"
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
            Priority items count toward the daily check-in. Secondary items stay visible but do
            not block completion. Try planning one or two days ahead: tomorrow,{" "}
            {addDays(today, 2)}, and beyond.
          </div>

          <button
            type="submit"
            className="planner-button planner-button-primary planner-ui rounded-full px-5 py-3 text-sm transition hover:opacity-92"
          >
            Save and open that day
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
