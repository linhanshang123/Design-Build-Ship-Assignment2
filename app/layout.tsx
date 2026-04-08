import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { PlannerProvider } from "@/lib/planner-context";
import { ThemeProvider } from "@/lib/theme-context";
import { getToday } from "@/lib/planner-utils";

export const metadata: Metadata = {
  title: "Day Planner",
  description: "A lightweight planner for daily focus, weekly overview, and momentum.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const today = getToday();

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <PlannerProvider today={today}>
            <SiteShell today={today}>{children}</SiteShell>
          </PlannerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
