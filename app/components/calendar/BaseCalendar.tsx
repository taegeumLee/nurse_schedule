"use client";

import { useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface BaseCalendarProps {
  events: any[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  renderEventContent?: (eventInfo: any) => JSX.Element;
  customButtons?: any;
  headerToolbar?: any;
  children?: React.ReactNode;
}

export default function BaseCalendar({
  events,
  currentDate,
  onDateChange,
  renderEventContent,
  customButtons,
  headerToolbar = {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth",
  },
  children,
}: BaseCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const handleSwipe = useCallback(
    (direction: "up" | "down") => {
      const calendar = calendarRef.current;
      if (calendar) {
        const api = calendar.getApi();
        if (direction === "up") {
          api.next();
        } else {
          api.prev();
        }
        onDateChange(api.getDate());
      }
    },
    [onDateChange]
  );

  return (
    <div className="w-full">
      {children}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale="ko"
        headerToolbar={headerToolbar}
        customButtons={customButtons}
        eventContent={renderEventContent}
        datesSet={(dateInfo) => onDateChange(dateInfo.view.currentStart)}
        height="auto"
      />
    </div>
  );
}
