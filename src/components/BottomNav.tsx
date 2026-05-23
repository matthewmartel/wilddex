"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "HOME" },
  { href: "/dex", icon: "grid_view", label: "DEX" },
  { href: "/scan", icon: "photo_camera", label: "SCAN" },
  { href: "/map", icon: "map", label: "MAP" },
  { href: "/profile", icon: "person", label: "PROFILE" },
];

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/dex") return pathname === "/dex" || pathname.startsWith("/animal/");
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 items-center gap-1 bg-surface px-2 py-2 rounded-t-xl border-t-[3px] border-on-background sm:gap-2 sm:px-4 sm:py-3"
      style={{ boxShadow: "0 -4px 0 0 rgba(27,28,28,1)" }}
    >
      {navItems.map(({ href, icon, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex h-14 min-w-0 flex-col items-center justify-center rounded-lg px-0.5 py-1 text-center transition-all sm:h-16 sm:px-1 sm:py-2 ${
              active
                ? "bg-primary-container text-on-primary-container border-2 border-transparent shadow-none sm:translate-x-[2px] sm:translate-y-[2px] sm:border-[3px]"
                : "text-on-surface-variant border-2 border-on-background bg-surface shadow-[2px_2px_0_0_rgba(27,28,28,1)] hover:bg-secondary-container sm:border-[3px] sm:shadow-[4px_4px_0_0_rgba(27,28,28,1)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span
              className="material-symbols-outlined mb-0.5 text-[20px] leading-none sm:mb-1 sm:text-[22px]"
              style={{
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {icon}
            </span>
            <span className="w-full truncate font-display text-[8px] font-bold tracking-normal leading-none sm:text-[9px]">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
