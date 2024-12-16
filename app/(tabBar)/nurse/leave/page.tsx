"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface LeaveRequest {
  id: string;
  date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comment?: string;
  type: "DAY" | "EVENING" | "NIGHT" | "OFF";
}

const shiftColors = {
  DAY: "#4CAF50", // Green
  EVENING: "#2196F3", // Blue
  NIGHT: "#9C27B0", // Purple
  OFF: "#757575", // Grey
};

const shiftLabels = {
  DAY: "데이",
  EVENING: "이브닝",
  NIGHT: "나이트",
  OFF: "휴무",
};

export default function LeaveRequestPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    reason: "",
    type: "OFF" as "DAY" | "EVENING" | "NIGHT" | "OFF",
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch("/api/leave-requests");
      if (!res.ok) throw new Error("휴가 신청 내역을 가져올 수 없습니다.");
      const data = await res.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("신청에 실패했습니다.");

      await fetchLeaveRequests();
      setShowForm(false);
      setFormData({ date: "", reason: "", type: "OFF" });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("휴무 신청을 취소하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/leave-requests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("휴무 신청 취소에 실패했습니다.");
      await fetchLeaveRequests();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDateClick = (arg: { dateStr: string }) => {
    setFormData((prev) => ({
      ...prev,
      date: arg.dateStr,
    }));
    setShowForm(true);
  };

  const calendarEvents = leaveRequests.map((request) => ({
    title: `${shiftLabels[request.type]} - ${
      request.status === "APPROVED"
        ? "승인됨"
        : request.status === "REJECTED"
        ? "거절됨"
        : "대기중"
    }`,
    start: request.date,
    end: request.date,
    backgroundColor:
      request.status === "APPROVED"
        ? shiftColors[request.type] // 승인된 경우 근무 유형별 색상
        : request.status === "REJECTED"
        ? "#F44336" // 거절된 경우 빨간색
        : "#FFC107", // 대기중인 경우 노란색
    borderColor: "transparent",
    allDay: true,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            휴무 신청
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            새 휴무 신청
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">새 신청</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">유형</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as
                          | "DAY"
                          | "EVENING"
                          | "NIGHT"
                          | "OFF",
                      }))
                    }
                    className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    {Object.entries(shiftLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">날짜</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">사유</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    신청하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          events={calendarEvents}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          height="auto"
          dateClick={handleDateClick}
        />
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">휴무 신청 내역</h3>
        <div className="space-y-4">
          {leaveRequests.map((request) => (
            <div
              key={request.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: shiftColors[request.type] }}
                    />
                    <p className="text-sm text-gray-600">
                      {format(new Date(request.date), "yyyy년 MM월 dd일")} (
                      {shiftLabels[request.type]})
                    </p>
                  </div>
                  <p className="mt-2">{request.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      request.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : request.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {request.status === "APPROVED"
                      ? "승인됨"
                      : request.status === "REJECTED"
                      ? "거절됨"
                      : "대기중"}
                  </span>
                  {request.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(request.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {request.comment && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {request.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
