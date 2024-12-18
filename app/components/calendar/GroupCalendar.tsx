"use client";

import { useState } from "react";
import BaseCalendar from "./BaseCalendar";
import { ShiftColors } from "@/app/types/schedule";
import GroupTable from "../group/GroupTable";
import { eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { defaultShiftType } from "@/app/types/schedule";

interface Schedule {
  userName: string;
  userId: string;
  date: string;
  shiftType: string;
}

interface GroupCalendarProps {
  schedules: Schedule[];
  shiftColors: ShiftColors;
  shiftLabels: Record<string, string>;
  members: any[];
}

export default function GroupCalendar({
  schedules,
  shiftColors,
  shiftLabels,
  members,
}: GroupCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<"calendar" | "table">("calendar");

  const events = schedules.map((schedule) => ({
    title: `${schedule.userName} - ${
      shiftLabels[schedule.shiftType as keyof typeof shiftLabels]
    }`,
    date: new Date(schedule.date),
    backgroundColor: shiftColors[schedule.shiftType as keyof ShiftColors],
    borderColor: shiftColors[schedule.shiftType as keyof ShiftColors],
    allDay: true,
    display: "block",
  }));

  const customButtons = {
    viewToggle: {
      text: viewType === "calendar" ? "표로 보기" : "캘린더로 보기",
      click: () => setViewType(viewType === "calendar" ? "table" : "calendar"),
    },
  };

  const getTableData = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });

    const tableSchedules: Record<string, Record<string, string>> = {};

    schedules.forEach((schedule) => {
      const dateStr = new Date(schedule.date).toISOString().split("T")[0];
      if (!tableSchedules[dateStr]) {
        tableSchedules[dateStr] = {};
      }
      tableSchedules[dateStr][schedule.userId] = schedule.shiftType;
    });

    return {
      days,
      users: members,
      tableSchedules,
    };
  };

  return viewType === "calendar" ? (
    <BaseCalendar
      events={events}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      customButtons={customButtons}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "viewToggle",
      }}
    />
  ) : (
    <GroupTable
      {...getTableData()}
      shiftColors={shiftColors}
      defaultShiftType={defaultShiftType}
    />
  );
}
