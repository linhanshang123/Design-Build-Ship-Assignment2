import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { PlannerProvider } from "@/lib/planner-context";

export const metadata: Metadata = {
  title: "Day Planner",
  description: "A lightweight planner for daily focus, weekly overview, and momentum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PlannerProvider>
          <SiteShell>{children}</SiteShell>
        </PlannerProvider>
      </body>
    </html>
  );
}
