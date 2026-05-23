"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wd-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-3 px-4 py-3 text-on-background hover:bg-secondary-container transition-colors border-b-[3px] border-on-background"
    >
      <span className="material-symbols-outlined text-on-surface-variant">
        {isDark ? "dark_mode" : "light_mode"}
      </span>
      <span className="font-sans text-sm font-medium flex-1 text-left">
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>
      {/* pill toggle */}
      <div
        className={`relative w-11 h-6 rounded-full border-[2px] border-on-background transition-colors ${
          isDark ? "bg-primary" : "bg-surface-variant"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-on-primary border-[1.5px] border-on-background transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
