export type PlannerItemKind = "task" | "time-block";
export type PlannerPriority = "priority" | "secondary";

export type PlannerItem = {
  id: string;
  date: string;
  title: string;
  kind: PlannerItemKind;
  priority: PlannerPriority;
  completed: boolean;
  startTime?: string;
  endTime?: string;
};

export type DayNote = {
  date: string;
  text: string;
};

export type WeeklyReflection = {
  weekStart: string;
  text: string;
};

export const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

export const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getToday() {
  return formatDateInput(new Date());
}

export function addDays(date: string, amount: number) {
  const next = parseDateInput(date);
  next.setDate(next.getDate() + amount);
  return formatDateInput(next);
}

export function startOfWeek(date: string) {
  const value = parseDateInput(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return formatDateInput(value);
}

export function getWeekDates(baseDate: string) {
  const start = startOfWeek(baseDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getPreviousWeekStart(baseDate: string) {
  return addDays(startOfWeek(baseDate), -7);
}

export function formatDisplayDate(date: string) {
  return longDateFormatter.format(parseDateInput(date));
}

export function formatWeekday(date: string) {
  return weekdayFormatter.format(parseDateInput(date));
}

export function isSameWeek(date: string, weekStart: string) {
  return startOfWeek(date) === weekStart;
}

export function sortPlannerItems(items: PlannerItem[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.startTime ?? "99:99";
    const rightTime = right.startTime ?? "99:99";
    if (leftTime !== rightTime) {
      return leftTime.localeCompare(rightTime);
    }
    if (left.priority !== right.priority) {
      return left.priority === "priority" ? -1 : 1;
    }
    return left.title.localeCompare(right.title);
  });
}

export function calculateCheckIn(items: PlannerItem[]) {
  const priorityItems = items.filter((item) => item.priority === "priority");
  if (priorityItems.length === 0) {
    return false;
  }
  return priorityItems.every((item) => item.completed);
}

export function buildWeekSummary(items: PlannerItem[], weekStart: string) {
  const weekItems = items.filter((item) => isSameWeek(item.date, weekStart));
  const completed = weekItems.filter((item) => item.completed).length;
  const priorityItems = weekItems.filter((item) => item.priority === "priority");
  const completedPriority = priorityItems.filter((item) => item.completed).length;
  const weekDates = getWeekDates(weekStart);
  const checkedInDays = weekDates.filter((date) =>
    calculateCheckIn(weekItems.filter((item) => item.date === date)),
  ).length;

  return {
    plannedCount: weekItems.length,
    completedCount: completed,
    checkedInDays,
    priorityRate:
      priorityItems.length === 0
        ? 0
        : Math.round((completedPriority / priorityItems.length) * 100),
  };
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
