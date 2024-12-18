"use client";

import { useState } from "react";
import BaseCalendar from "./BaseCalendar";
import { ShiftColors } from "@/app/types/schedule";

interface Schedule {
  shiftType: string;
  date: Date;
}

interface NurseCalendarProps {
  schedules: Schedule[];
  shiftColors: ShiftColors;
  shiftLabels: Record<string, string>;
}

export default function NurseCalendar({
  schedules,
  shiftColors,
  shiftLabels,
}: NurseCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = schedules.map((schedule) => ({
    title: shiftLabels[schedule.shiftType as keyof typeof shiftLabels],
    date: schedule.date,
    backgroundColor: shiftColors[schedule.shiftType as keyof ShiftColors],
    borderColor: shiftColors[schedule.shiftType as keyof ShiftColors],
    allDay: true,
    display: "block",
  }));

  const renderEventContent = (eventInfo: any) => (
    <div className="p-1 text-xs text-white font-medium text-center rounded-md shadow-sm transition-transform hover:scale-105">
      {eventInfo.event.title}
    </div>
  );

  return (
    <BaseCalendar
      events={events}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      renderEventContent={renderEventContent}
    />
  );
}
