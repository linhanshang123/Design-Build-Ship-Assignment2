import { HomePageClient } from "@/app/home-page-client";
import { getToday } from "@/lib/planner-utils";

export default function HomePage() {
  return <HomePageClient today={getToday()} />;
}
