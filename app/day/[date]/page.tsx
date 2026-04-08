import { notFound } from "next/navigation";
import { DayPageClient } from "@/app/day/[date]/day-page-client";
import { getToday, parseDateInput } from "@/lib/planner-utils";

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parseDateInput(date).valueOf())) {
    notFound();
  }

  return <DayPageClient date={date} today={getToday()} />;
}
