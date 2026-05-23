"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem("wd-theme");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(dark: boolean) {
      document.documentElement.classList.toggle("dark", dark);
    }

    if (stored === "dark") {
      applyTheme(true);
    } else if (stored === "light") {
      applyTheme(false);
    } else {
      applyTheme(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, []);

  return <>{children}</>;
}
