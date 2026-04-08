import { WeekPageClient } from "@/app/week/week-page-client";
import { getToday } from "@/lib/planner-utils";

export default function WeekPage() {
  return <WeekPageClient today={getToday()} />;
}
