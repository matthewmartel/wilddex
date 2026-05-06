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
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface rounded-t-xl border-t-[3px] border-on-background"
      style={{ boxShadow: "0 -4px 0 0 rgba(27,28,28,1)" }}
    >
      {navItems.map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1 rounded-lg transition-all ${
              isActive
                ? "bg-primary-container text-on-primary-container translate-x-[2px] translate-y-[2px] border-[3px] border-transparent"
                : "text-on-surface-variant border-[3px] border-on-background bg-surface hover:bg-secondary-container shadow-[4px_4px_0_0_rgba(27,28,28,1)]"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px] mb-1 leading-none"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {icon}
            </span>
            <span className="font-display text-[9px] font-bold tracking-normal leading-none">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
