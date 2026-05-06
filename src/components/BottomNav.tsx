"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "HOME" },
  { href: "/dex", icon: "grid_view", label: "DEX" },
  { href: "/scan", icon: "photo_camera", label: "SCAN" },
  { href: "/map", icon: "map", label: "MAP" },
  { href: "/regions", icon: "explore", label: "REGIONS" },
  { href: "/profile", icon: "person", label: "PROFILE" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 items-center gap-1.5 bg-surface px-2 py-2 rounded-t-xl border-t-[3px] border-on-background sm:gap-2 sm:px-4 sm:py-3"
      style={{ boxShadow: "0 -4px 0 0 rgba(27,28,28,1)" }}
    >
      {navItems.map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex h-14 min-w-0 flex-col items-center justify-center rounded-lg px-0.5 py-1 text-center transition-all sm:h-16 sm:px-1 sm:py-2 ${
              isActive
                ? "bg-primary-container text-on-primary-container border-2 border-transparent shadow-none sm:translate-x-[2px] sm:translate-y-[2px] sm:border-[3px]"
                : "text-on-surface-variant border-2 border-on-background bg-surface shadow-[2px_2px_0_0_rgba(27,28,28,1)] hover:bg-secondary-container sm:border-[3px] sm:shadow-[4px_4px_0_0_rgba(27,28,28,1)]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span
              className="material-symbols-outlined mb-0.5 text-[20px] leading-none sm:mb-1 sm:text-[22px]"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
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
