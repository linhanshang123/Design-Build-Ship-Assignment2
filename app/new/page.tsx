import { NewPageClient } from "@/app/new/new-page-client";
import { getToday } from "@/lib/planner-utils";

export default function NewPage() {
  return <NewPageClient today={getToday()} />;
}
