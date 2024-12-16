"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface HospitalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  type: "CONFERENCE" | "TRAINING" | "EVENT" | "OTHER";
}

const eventTypeColors = {
  CONFERENCE: "#3B82F6", // Blue
  TRAINING: "#10B981", // Green
  EVENT: "#F59E0B", // Yellow
  OTHER: "#6B7280", // Gray
};

const eventTypeLabels = {
  CONFERENCE: "컨퍼런스",
  TRAINING: "교육",
  EVENT: "행사",
  OTHER: "기타",
};

export default function HospitalSchedulePage() {
  const [events, setEvents] = useState<HospitalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/hospital-events");
        if (!res.ok) throw new Error("병원 일정을 가져올 수 없습니다.");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          병원 일정
        </h2>
        <div className="flex items-center justify-center gap-4 mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
          {Object.entries(eventTypeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    eventTypeColors[type as keyof typeof eventTypeColors],
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-700/50 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{
                        backgroundColor: eventTypeColors[event.type],
                      }}
                    >
                      {eventTypeLabels[event.type]}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {event.title}
                    </h3>
                  </div>
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {format(new Date(event.start), "yyyy년 MM월 dd일", {
                      locale: ko,
                    })}
                    {event.start !== event.end && (
                      <>
                        {" "}
                        ~{" "}
                        {format(new Date(event.end), "yyyy년 MM월 dd일", {
                          locale: ko,
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
