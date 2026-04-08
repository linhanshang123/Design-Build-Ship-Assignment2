"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DayNote,
  PlannerItem,
  WeeklyReflection,
  addDays,
  buildWeekSummary,
  calculateCheckIn,
  createId,
  getPreviousWeekStart,
  getToday,
  sortPlannerItems,
  startOfWeek,
} from "@/lib/planner-utils";

type NewPlannerItem = Omit<PlannerItem, "id" | "completed">;

type PlannerContextValue = {
  items: PlannerItem[];
  dayNotes: DayNote[];
  weeklyReflections: WeeklyReflection[];
  addItem: (item: NewPlannerItem) => void;
  toggleItem: (id: string) => void;
  updateDayNote: (date: string, text: string) => void;
  updateWeeklyReflection: (weekStart: string, text: string) => void;
  getItemsForDate: (date: string) => PlannerItem[];
  getDayNote: (date: string) => string;
  getWeeklyReflection: (weekStart: string) => string;
  isCheckedIn: (date: string) => boolean;
  getWeekSummary: (weekStart: string) => ReturnType<typeof buildWeekSummary>;
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

function createSeedItems() {
  const today = getToday();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);

  return sortPlannerItems([
    {
      id: createId("item"),
      date: today,
      title: "Finish assignment layout pass",
      kind: "task",
      priority: "priority",
      completed: false,
    },
    {
      id: createId("item"),
      date: today,
      title: "Deep work block",
      kind: "time-block",
      priority: "priority",
      completed: false,
      startTime: "09:00",
      endTime: "11:00",
    },
    {
      id: createId("item"),
      date: today,
      title: "Reply to messages",
      kind: "task",
      priority: "secondary",
      completed: false,
    },
    {
      id: createId("item"),
      date: tomorrow,
      title: "Gym before class",
      kind: "time-block",
      priority: "priority",
      completed: false,
      startTime: "07:30",
      endTime: "08:30",
    },
    {
      id: createId("item"),
      date: tomorrow,
      title: "Review lecture notes",
      kind: "task",
      priority: "priority",
      completed: false,
    },
    {
      id: createId("item"),
      date: dayAfter,
      title: "Plan weekend errands",
      kind: "task",
      priority: "secondary",
      completed: false,
    },
  ]);
}

function createSeedDayNotes(): DayNote[] {
  return [
    {
      date: getToday(),
      text: "Keep the day realistic. Finish the top priorities first, then pick up the smaller items.",
    },
  ];
}

function createSeedReflection(): WeeklyReflection[] {
  const previousWeek = getPreviousWeekStart(getToday());
  return [
    {
      weekStart: previousWeek,
      text: "Best rhythm came from planning the next day before bed. I slipped when tasks stayed vague.",
    },
  ];
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PlannerItem[]>(() => createSeedItems());
  const [dayNotes, setDayNotes] = useState<DayNote[]>(() => createSeedDayNotes());
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflection[]>(() =>
    createSeedReflection(),
  );

  const value = useMemo<PlannerContextValue>(
    () => ({
      items,
      dayNotes,
      weeklyReflections,
      addItem: (item) => {
        setItems((current) =>
          sortPlannerItems([
            ...current,
            {
              ...item,
              id: createId("item"),
              completed: false,
            },
          ]),
        );
      },
      toggleItem: (id) => {
        setItems((current) =>
          sortPlannerItems(
            current.map((item) =>
              item.id === id ? { ...item, completed: !item.completed } : item,
            ),
          ),
        );
      },
      updateDayNote: (date, text) => {
        setDayNotes((current) => {
          const existing = current.find((note) => note.date === date);
          if (existing) {
            return current.map((note) => (note.date === date ? { ...note, text } : note));
          }
          return [...current, { date, text }];
        });
      },
      updateWeeklyReflection: (weekStart, text) => {
        setWeeklyReflections((current) => {
          const existing = current.find((entry) => entry.weekStart === weekStart);
          if (existing) {
            return current.map((entry) =>
              entry.weekStart === weekStart ? { ...entry, text } : entry,
            );
          }
          return [...current, { weekStart, text }];
        });
      },
      getItemsForDate: (date) => sortPlannerItems(items.filter((item) => item.date === date)),
      getDayNote: (date) => dayNotes.find((note) => note.date === date)?.text ?? "",
      getWeeklyReflection: (weekStart) =>
        weeklyReflections.find((entry) => entry.weekStart === weekStart)?.text ?? "",
      isCheckedIn: (date) => calculateCheckIn(items.filter((item) => item.date === date)),
      getWeekSummary: (weekStart) => buildWeekSummary(items, startOfWeek(weekStart)),
    }),
    [dayNotes, items, weeklyReflections],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlanner must be used inside PlannerProvider");
  }
  return context;
}
