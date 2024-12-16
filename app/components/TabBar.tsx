"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

export default function TabBar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  const tabs = [
    {
      href: "/nurse",
      label: "홈",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    // ... 다른 탭들
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 ${currentTheme.background.card} border-t ${currentTheme.border.primary}`}
    >
      <nav className="flex justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                isActive
                  ? currentTheme.tabBar.active
                  : currentTheme.tabBar.inactive
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={tab.icon}
                />
              </svg>
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
