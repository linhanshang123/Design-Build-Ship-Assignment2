"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : "border-[var(--line)] bg-white/70 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </Link>
  );
}
