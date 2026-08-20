"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

export default function NavItems() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-7 text-sm font-medium">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`transition-colors hover:text-amber-400 ${active ? "text-slate-100" : "text-slate-500"}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
