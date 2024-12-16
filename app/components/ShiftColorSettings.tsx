"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { slideUp } from "@/app/utils/animations";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

const shiftTypes = {
  DAY: "데이",
  EVENING: "이브닝",
  NIGHT: "나이트",
  OFF: "휴무",
} as const;

const predefinedColors = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#757575", // Grey
  "#F44336", // Red
  "#009688", // Teal
  "#FF9800", // Orange
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#E91E63", // Pink
  "#3F51B5", // Indigo
  "#CDDC39", // Lime
  "#FFC107", // Amber
  "#00BCD4", // Cyan
  "#9E9E9E", // Grey
];

export default function ShiftColorSettings() {
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  const [colors, setColors] = useState(() => {
    const savedColors = localStorage.getItem("shiftColors");
    return savedColors
      ? JSON.parse(savedColors)
      : {
          DAY: "#4CAF50",
          EVENING: "#2196F3",
          NIGHT: "#9C27B0",
          OFF: "#757575",
        };
  });
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(
    null
  );
  const colorPickerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeColorPicker) {
        const ref = colorPickerRefs.current[activeColorPicker];
        if (ref && !ref.contains(event.target as Node)) {
          setActiveColorPicker(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeColorPicker]);

  const handleColorChange = (type: keyof typeof shiftTypes, color: string) => {
    const newColors = { ...colors, [type]: color };
    setColors(newColors);
    localStorage.setItem("shiftColors", JSON.stringify(newColors));
    setActiveColorPicker(null);
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`${currentTheme.background.card} backdrop-blur-sm rounded-xl shadow-lg p-6 mt-6`}
    >
      <h3
        className={`text-lg font-bold mb-4 ${currentTheme.text.primary} flex items-center`}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        근무 색상 설정
      </h3>
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(shiftTypes).map(([type, label]) => (
          <div
            key={type}
            className={`flex items-center gap-2 ${currentTheme.background.card} px-4 py-2 rounded-lg relative`}
          >
            <span className={currentTheme.text.secondary}>{label}</span>
            <div
              className="relative"
              ref={(el) => {
                colorPickerRefs.current[type] = el;
              }}
            >
              <div
                className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: colors[type as keyof typeof colors] }}
                onClick={() =>
                  setActiveColorPicker(activeColorPicker === type ? null : type)
                }
              />
              {activeColorPicker === type && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-50">
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {predefinedColors.map((color) => (
                      <div
                        key={color}
                        className="w-6 h-6 rounded cursor-pointer hover:scale-110 transform transition-transform border border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          handleColorChange(
                            type as keyof typeof shiftTypes,
                            color
                          )
                        }
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <label className="text-sm text-gray-600 dark:text-gray-300">
                      직접 선택:
                    </label>
                    <input
                      type="color"
                      value={colors[type as keyof typeof colors]}
                      onChange={(e) =>
                        handleColorChange(
                          type as keyof typeof shiftTypes,
                          e.target.value
                        )
                      }
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
