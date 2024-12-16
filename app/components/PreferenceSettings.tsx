"use client";

import { useState } from "react";
import Toast from "./Toast";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp } from "@/app/utils/animations";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

const shiftLabels = {
  DAY: "데이",
  EVENING: "이브닝",
  NIGHT: "나이트",
};

interface PreferenceSettingsProps {
  initialPreferences?: {
    preferredOffDaysPerMonth: number;
    shiftPreference: string;
  };
}

export default function PreferenceSettings({
  initialPreferences,
}: PreferenceSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [offDays, setOffDays] = useState(
    initialPreferences?.preferredOffDaysPerMonth || 8
  );
  const [shiftOrder, setShiftOrder] = useState<string[]>(() => {
    if (initialPreferences?.shiftPreference) {
      return initialPreferences.shiftPreference.split(",");
    }
    return ["DAY", "EVENING", "NIGHT"];
  });
  const [draggedShift, setDraggedShift] = useState<string | null>(null);
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  const handleDragStart = (shift: string) => {
    setDraggedShift(shift);
  };

  const handleDragOver = (e: React.DragEvent, targetShift: string) => {
    e.preventDefault();
    if (!draggedShift || draggedShift === targetShift) return;

    const oldIndex = shiftOrder.indexOf(draggedShift);
    const newIndex = shiftOrder.indexOf(targetShift);

    const newOrder = [...shiftOrder];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, draggedShift);
    setShiftOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedShift(null);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredOffDaysPerMonth: offDays,
          shiftPreference: shiftOrder.join(","),
        }),
      });

      if (!res.ok) throw new Error("선호도 설정을 저장할 수 없습니다.");
      setShowToast(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error:", error);
      alert("선호도 저장에 실패했습니다.");
    }
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`${currentTheme.background.card} backdrop-blur-sm rounded-xl shadow-lg p-6 mt-6`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3
          className={`text-lg font-bold ${currentTheme.text.primary} flex items-center`}
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
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          근무 선호도 설정
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={`${currentTheme.button.primary} px-4 py-2 rounded-lg`}
          >
            수정
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            한달 희망 오프 수
          </label>
          {isEditing ? (
            <>
              <input
                type="range"
                min="8"
                max="20"
                value={offDays}
                onChange={(e) => setOffDays(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center mt-2">{offDays}일</div>
            </>
          ) : (
            <div className="text-lg">{offDays}일</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            선호 근무 순서
          </label>
          {isEditing ? (
            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {shiftOrder.map((shift, index) => (
                <div
                  key={shift}
                  draggable
                  onDragStart={() => handleDragStart(shift)}
                  onDragOver={(e) => handleDragOver(e, shift)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 cursor-move hover:shadow-lg transition-shadow ${
                    draggedShift === shift ? "opacity-50" : ""
                  }`}
                >
                  <span>{shiftLabels[shift as keyof typeof shiftLabels]}</span>
                  {index < shiftOrder.length - 1 && (
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {shiftOrder.map((shift, index) => (
                <div key={shift} className="flex items-center">
                  <span className="bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                    {shiftLabels[shift as keyof typeof shiftLabels]}
                  </span>
                  {index < shiftOrder.length - 1 && (
                    <svg
                      className="w-4 h-4 text-gray-400 mx-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex justify-end gap-2"
            >
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                저장
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showToast && (
          <Toast
            message="설정이 저장되었습니다"
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
