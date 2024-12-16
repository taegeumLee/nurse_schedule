"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

interface UserInfo {
  name: string;
  email: string;
  role: string;
  userId: string;
  department: string;
}

interface Schedule {
  id: string;
  date: string;
  shiftType: string;
}

interface ShiftColors {
  DAY: string;
  EVENING: string;
  NIGHT: string;
  OFF: string;
}

const defaultShiftColors: ShiftColors = {
  DAY: "#4CAF50",
  EVENING: "#2196F3",
  NIGHT: "#9C27B0",
  OFF: "#757575",
};

const shiftLabels = {
  DAY: "데이",
  EVENING: "이브닝",
  NIGHT: "나이트",
  OFF: "오프",
};

export default function NursePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shiftColors, setShiftColors] =
    useState<ShiftColors>(defaultShiftColors);
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const savedColors = localStorage.getItem("shiftColors");
    if (savedColors) {
      setShiftColors(JSON.parse(savedColors));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 용자 정보 가져오기
        const userRes = await fetch("/api/user/me");
        if (!userRes.ok) throw new Error("사용자 정보를 가져올 수 없습니다.");
        const userData = await userRes.json();
        setUserInfo(userData);

        // 스케줄 정보 가져오기
        const scheduleRes = await fetch("/api/schedules");
        if (!scheduleRes.ok)
          throw new Error("스케줄 정보를 가져올 수 없습니다.");
        const scheduleData = await scheduleRes.json();
        setSchedules(scheduleData);
      } catch (error) {
        console.error("데이터 조회 중 오류 ��생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSwipe = useCallback((direction: "up" | "down") => {
    const calendar = calendarRef.current;
    if (calendar) {
      const api = calendar.getApi();
      if (direction === "up") {
        api.next();
      } else {
        api.prev();
      }
      setCurrentDate(api.getDate());
    }
  }, []);

  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: Event) => {
      touchStartY = (e as TouchEvent).touches[0].clientY;
    };

    const handleTouchEnd = (e: Event) => {
      touchEndY = (e as TouchEvent).changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      const threshold = 50; // 스와이프 감지 임계값

      if (Math.abs(diff) > threshold) {
        handleSwipe(diff > 0 ? "up" : "down");
      }
    };

    const calendarEl = document.querySelector(".fc");
    if (calendarEl) {
      calendarEl.addEventListener("touchstart", handleTouchStart);
      calendarEl.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (calendarEl) {
        calendarEl.removeEventListener("touchstart", handleTouchStart);
        calendarEl.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [handleSwipe]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const calendarEvents = schedules.map((schedule) => ({
    title: shiftLabels[schedule.shiftType as keyof typeof shiftLabels],
    date: schedule.date,
    backgroundColor:
      shiftColors[schedule.shiftType as keyof typeof shiftColors],
    borderColor: shiftColors[schedule.shiftType as keyof typeof shiftColors],
    allDay: true,
    display: "block",
  }));

  // 이번 달의 근무 유형별 카운트 계산
  const calculateMonthlyShiftCounts = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return schedules.reduce((acc, schedule) => {
      const scheduleDate = new Date(schedule.date);
      if (
        scheduleDate.getMonth() === currentMonth &&
        scheduleDate.getFullYear() === currentYear
      ) {
        acc[schedule.shiftType] = (acc[schedule.shiftType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const monthlyShiftCounts = calculateMonthlyShiftCounts();

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${currentTheme.background.primary} p-4 sm:p-6`}
    >
      {/* 상단 프로필 섹션 */}
      <div
        className={`${currentTheme.background.card} backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {userInfo?.name[0]}
            </div>
            <div>
              <p className={`text-sm ${currentTheme.text.tertiary} mb-1`}>
                {userInfo?.department || "부서 미지정"}
              </p>
              <h2 className={`text-2xl font-bold ${currentTheme.text.primary}`}>
                {userInfo?.name}
              </h2>
              <p className={currentTheme.text.secondary}>{userInfo?.email}</p>
            </div>
          </div>
          <Link
            href="/nurse/leave"
            className={`${currentTheme.button.primary} px-4 py-2 rounded-lg`}
          >
            휴무 신청
          </Link>
        </div>
      </div>

      {/* 캘린더 섹션 */}
      <div
        className={`${currentTheme.background.card} backdrop-blur-sm rounded-xl shadow-lg p-6`}
      >
        <div className="text-center mb-4">
          <h2 className={`text-xl font-bold ${currentTheme.text.primary}`}>
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </h2>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          {Object.entries(shiftLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: shiftColors[type as keyof ShiftColors],
                }}
              />
              <span>{label}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {monthlyShiftCounts[type] || 0}
              </span>
            </div>
          ))}
        </div>
        <style jsx global>{`
          .fc {
            --fc-border-color: ${theme === "dark"
              ? "rgba(55, 65, 81, 0.8)"
              : "rgba(163, 163, 163, 0.8)"};
            --fc-today-bg-color: ${theme === "dark"
              ? "rgba(30, 58, 138, 0.3)"
              : "rgba(219, 234, 254, 0.7)"};
            --fc-page-bg-color: ${theme === "dark" ? "#1f2937" : "#e5e5e5"};
            --fc-neutral-bg-color: ${theme === "dark"
              ? "rgba(55, 65, 81, 0.3)"
              : "rgba(163, 163, 163, 0.2)"};
          }

          .fc .fc-daygrid-day-number {
            color: ${theme === "dark" ? "#e5e7eb" : "#171717"};
            font-weight: 500;
          }

          .fc .fc-col-header-cell-cushion {
            color: ${theme === "dark" ? "#e5e7eb" : "#171717"};
            font-weight: 600;
          }

          .fc .fc-button {
            background-color: ${theme === "dark" ? "#4b5563" : "#3b82f6"};
            color: white;
            font-weight: 500;
          }

          .fc .fc-button:hover {
            background-color: ${theme === "dark" ? "#374151" : "#2563eb"};
          }

          .fc .fc-daygrid-day.fc-day-today {
            background-color: var(--fc-today-bg-color) !important;
          }

          .fc-theme-standard td,
          .fc-theme-standard th {
            border-color: var(--fc-border-color);
          }

          .fc-daygrid-day-frame {
            background-color: ${theme === "dark"
              ? "rgba(31, 41, 55, 0.7)"
              : "rgba(245, 245, 245, 0.7)"};
          }

          .fc-scroller {
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          .fc-scroller-liquid-absolute {
            position: relative !important;
            overflow: visible !important;
          }

          .fc-view-harness {
            overflow: visible !important;
          }
        `}</style>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          events={calendarEvents}
          headerToolbar={false}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={1}
          datesSet={(dateInfo) => {
            setCurrentDate(dateInfo.view.currentStart);
          }}
          eventContent={(eventInfo) => (
            <div className="p-1 text-xs text-white font-medium text-center rounded-md shadow-sm transition-transform hover:scale-105">
              {eventInfo.event.title}
            </div>
          )}
          dayCellClassNames="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          editable={false}
          selectable={false}
          dragScroll={true}
        />
      </div>
    </div>
  );
}
