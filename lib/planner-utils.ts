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

const plannerTimeZone = "America/Chicago";

export const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

export const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export const longDateWithYearFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const shortTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: plannerTimeZone,
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

function parseDateInputForDisplay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function setDateTime(date: string, time: string) {
  const value = parseDateInput(date);
  const [hours, minutes] = time.split(":").map(Number);
  value.setHours(hours, minutes, 0, 0);
  return value;
}

export function getToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: plannerTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export function addDays(date: string, amount: number) {
  const next = parseDateInput(date);
  next.setDate(next.getDate() + amount);
  return formatDateInput(next);
}

export function addWeeks(date: string, amount: number) {
  return addDays(date, amount * 7);
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
  return longDateFormatter.format(parseDateInputForDisplay(date));
}

export function formatWeekday(date: string) {
  return weekdayFormatter.format(parseDateInputForDisplay(date));
}

export function formatDisplayDateWithYear(date: string) {
  return longDateWithYearFormatter.format(parseDateInputForDisplay(date));
}

export function formatClockTime(date: Date) {
  return shortTimeFormatter.format(date);
}

function formatTimeOfDay(time: string) {
  const [rawHours, rawMinutes] = time.split(":").map(Number);
  const suffix = rawHours >= 12 ? "PM" : "AM";
  const hours = rawHours % 12 || 12;
  return `${hours}:${`${rawMinutes}`.padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(startTime: string, endTime?: string) {
  const start = formatTimeOfDay(startTime);
  if (!endTime) {
    return start;
  }
  return `${start} - ${formatTimeOfDay(endTime)}`;
}

export function formatDurationFromMinutes(totalMinutes: number) {
  const safe = Math.max(0, totalMinutes);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
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

export type TimeBlockStatus =
  | {
      state: "unscheduled";
      label: "Add an end time to track this block.";
      progress: 0;
    }
  | {
      state: "upcoming";
      label: string;
      progress: 0;
    }
  | {
      state: "active";
      label: string;
      progress: number;
    }
  | {
      state: "ended";
      label: string;
      progress: 100;
    };

export function getTimeBlockStatus(item: PlannerItem, now: Date): TimeBlockStatus {
  if (!item.startTime || !item.endTime) {
    return {
      state: "unscheduled",
      label: "Add an end time to track this block.",
      progress: 0,
    };
  }

  const start = setDateTime(item.date, item.startTime);
  const end = setDateTime(item.date, item.endTime);

  if (now < start) {
    const diff = Math.ceil((start.getTime() - now.getTime()) / 60000);
    return {
      state: "upcoming",
      label: `Starts in ${formatDurationFromMinutes(diff)}`,
      progress: 0,
    };
  }

  if (now >= end) {
    const diff = Math.max(1, Math.floor((now.getTime() - end.getTime()) / 60000));
    return {
      state: "ended",
      label: `Ended ${formatDurationFromMinutes(diff)} ago`,
      progress: 100,
    };
  }

  const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
  const remaining = Math.max(1, Math.ceil((end.getTime() - now.getTime()) / 60000));
  const elapsed = total - remaining;

  return {
    state: "active",
    label: `${formatDurationFromMinutes(remaining)} left`,
    progress: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))),
  };
}

export function getActiveTimeBlock(items: PlannerItem[], now: Date) {
  return items
    .filter(
      (item) =>
        item.kind === "time-block" && item.startTime && item.endTime && !item.completed,
    )
    .filter((item) => getTimeBlockStatus(item, now).state === "active")
    .sort((left, right) => parseTimeToMinutes(left.startTime!) - parseTimeToMinutes(right.startTime!))[0];
}

export function getUpcomingTimeBlocks(items: PlannerItem[], now: Date, windowMinutes = 60) {
  return items
    .filter(
      (item) =>
        item.kind === "time-block" && item.startTime && item.endTime && !item.completed,
    )
    .filter((item) => {
      const status = getTimeBlockStatus(item, now);
      if (status.state !== "upcoming") {
        return false;
      }
      const start = setDateTime(item.date, item.startTime!);
      const diff = Math.ceil((start.getTime() - now.getTime()) / 60000);
      return diff <= windowMinutes;
    })
    .sort((left, right) => parseTimeToMinutes(left.startTime!) - parseTimeToMinutes(right.startTime!));
}

export function getLaterPriorityTimeBlock(items: PlannerItem[], now: Date) {
  return items
    .filter(
      (item) =>
        item.kind === "time-block" &&
        item.priority === "priority" &&
        item.startTime &&
        item.endTime &&
        !item.completed,
    )
    .filter((item) => getTimeBlockStatus(item, now).state === "upcoming")
    .sort((left, right) => parseTimeToMinutes(left.startTime!) - parseTimeToMinutes(right.startTime!))[0];
}
