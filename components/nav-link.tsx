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
      className={`planner-nav rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "planner-nav-active"
          : "planner-nav-inactive"
      }`}
    >
      {children}
    </Link>
  );
}
