"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import GroupTable from "./GroupTable";

interface Schedule {
  id: string;
  userId: string;
  userName: string;
  date: string;
  shiftType: string;
}

interface GroupCalendarProps {
  schedules: Schedule[];
  shiftColors: Record<string, string>;
}

const defaultShiftType = {
  DAY: "D",
  EVENING: "E",
  NIGHT: "N",
  OFF: "OFF",
};

const shiftLabels = {
  DAY: "데이",
  EVENING: "이브닝",
  NIGHT: "나이트",
  OFF: "오프",
};

interface TableSchedule {
  [date: string]: {
    [userId: string]: string;
  };
}

export default function GroupCalendar({
  schedules,
  shiftColors,
}: GroupCalendarProps) {
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;
  const [selectedShiftTypes, setSelectedShiftTypes] = useState<Set<string>>(
    new Set(Object.keys(defaultShiftType))
  );
  const [viewType, setViewType] = useState<"calendar" | "table">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleShiftTypeToggle = (shiftType: string) => {
    const newSelectedTypes = new Set(selectedShiftTypes);
    if (newSelectedTypes.has(shiftType)) {
      newSelectedTypes.delete(shiftType);
    } else {
      newSelectedTypes.add(shiftType);
    }
    setSelectedShiftTypes(newSelectedTypes);
  };

  const filteredEvents = schedules
    .filter((schedule) => selectedShiftTypes.has(schedule.shiftType))
    .map((schedule) => ({
      title: `${
        defaultShiftType[schedule.shiftType as keyof typeof defaultShiftType]
      } | ${schedule.userName}`,
      date: schedule.date,
      backgroundColor:
        shiftColors[schedule.shiftType as keyof typeof shiftColors],
      borderColor: shiftColors[schedule.shiftType as keyof typeof shiftColors],
    }));

  const getTableData = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    const tableSchedules: TableSchedule = {};
    const userMap = new Map<string, string>();

    schedules.forEach((schedule) => {
      if (!selectedShiftTypes.has(schedule.shiftType)) return;

      const dateStr = schedule.date;
      if (!tableSchedules[dateStr]) {
        tableSchedules[dateStr] = {};
      }
      tableSchedules[dateStr][schedule.userId] = schedule.shiftType;
      userMap.set(schedule.userId, schedule.userName);
    });

    return {
      days,
      tableSchedules,
      users: Array.from(userMap.entries()).map(([id, name]) => ({ id, name })),
    };
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        {viewType === "calendar" && (
          <div className="flex flex-wrap gap-4">
            {Object.entries(shiftLabels).map(([shiftType, label]) => (
              <label
                key={shiftType}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedShiftTypes.has(shiftType)}
                  onChange={() => handleShiftTypeToggle(shiftType)}
                  className="form-checkbox h-4 w-4 rounded border-2 bg-transparent transition duration-200 ease-in-out transform hover:scale-110"
                />
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    color: shiftColors[shiftType as keyof typeof shiftColors],
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        shiftColors[shiftType as keyof typeof shiftColors],
                    }}
                  />
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}
        <div className={`flex gap-2 ${viewType === "table" ? "ml-auto" : ""}`}>
          <button
            onClick={() => setViewType("calendar")}
            className={`px-3 py-1.5 rounded-lg ${
              viewType === "calendar"
                ? currentTheme.button.primary
                : currentTheme.button.secondary
            }`}
          >
            캘린더
          </button>
          <button
            onClick={() => setViewType("table")}
            className={`px-3 py-1.5 rounded-lg ${
              viewType === "table"
                ? currentTheme.button.primary
                : currentTheme.button.secondary
            }`}
          >
            표
          </button>
        </div>
      </div>

      {viewType === "calendar" ? (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          locale="ko"
          height="auto"
          dayCellClassNames={`${currentTheme.background.card}`}
          datesSet={(dateInfo) => setCurrentDate(dateInfo.start)}
        />
      ) : (
        <GroupTable
          {...getTableData()}
          shiftColors={shiftColors}
          defaultShiftType={defaultShiftType}
        />
      )}
    </div>
  );
}
