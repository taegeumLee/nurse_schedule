"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";
import { ShiftColors } from "@/app/types/schedule";

interface User {
  id: string;
  name: string;
}

interface TableSchedule {
  [date: string]: {
    [userId: string]: string;
  };
}

interface GroupTableProps {
  days: Date[];
  users: User[];
  tableSchedules: TableSchedule;
  shiftColors: ShiftColors;
  defaultShiftType: Record<string, string>;
}

export default function GroupTable({
  days,
  users,
  tableSchedules,
  shiftColors,
  defaultShiftType,
}: GroupTableProps) {
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 sticky left-0 bg-white dark:bg-gray-800">
              날짜
            </th>
            {users.map((user) => (
              <th key={user.id} className="border p-2">
                {user.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayOfWeek = format(day, "E", { locale: ko });
            const isSaturday = dayOfWeek === "토";
            const isSunday = dayOfWeek === "일";

            return (
              <tr key={dateStr}>
                <td
                  className={`border p-2 sticky left-0 bg-white dark:bg-gray-800 whitespace-nowrap ${
                    isSunday
                      ? "text-red-500"
                      : isSaturday
                      ? "text-blue-500"
                      : ""
                  }`}
                >
                  {format(day, "M.d")} ({dayOfWeek})
                </td>
                {users.map((user) => {
                  const shiftType = tableSchedules[dateStr]?.[user.id];
                  return (
                    <td
                      key={`${dateStr}-${user.id}`}
                      className="border p-2 text-center"
                    >
                      {shiftType && (
                        <span
                          className="inline-block w-8 h-8 rounded-lg leading-8"
                          style={{
                            backgroundColor:
                              shiftColors[
                                shiftType as keyof typeof shiftColors
                              ],
                            color: "#fff",
                          }}
                        >
                          {
                            defaultShiftType[
                              shiftType as keyof typeof defaultShiftType
                            ]
                          }
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
