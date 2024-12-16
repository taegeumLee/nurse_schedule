"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShiftColorSettings from "@/app/components/ShiftColorSettings";
import PreferenceSettings from "@/app/components/PreferenceSettings";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

interface UserInfo {
  name: string;
  email: string;
  role: string;
  userId: string;
  department: string;
  preferredOffDaysPerMonth: number;
  shiftPreference: string;
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/user/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("사용자 정보를 가져올 수 없습니다.");
        const data = await res.json();
        setUserInfo(data);
      } catch (error) {
        console.error("Error:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${currentTheme.background.primary} p-4 sm:p-6`}
    >
      <div
        className={`${currentTheme.background.card} backdrop-blur-sm rounded-xl shadow-lg p-6`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {userInfo?.name[0]}
          </div>
          <div className="text-center">
            <p className={`text-sm ${currentTheme.text.tertiary}`}>
              {userInfo?.department || "부서 미지정"}
            </p>
            <h2
              className={`text-2xl font-bold ${currentTheme.text.primary} mt-1`}
            >
              {userInfo?.name}
            </h2>
            <p className={`${currentTheme.text.secondary} mt-1`}>
              {userInfo?.email}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentTheme.button.secondary} transition-colors`}
          >
            {theme === "dark" ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
                라이트 모드
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                다크 모드
              </>
            )}
          </button>
        </div>
      </div>

      <ShiftColorSettings />
      <PreferenceSettings
        initialPreferences={
          userInfo
            ? {
                preferredOffDaysPerMonth: userInfo.preferredOffDaysPerMonth,
                shiftPreference: userInfo.shiftPreference,
              }
            : undefined
        }
      />

      <button
        onClick={handleLogout}
        className={`mt-6 w-full flex items-center justify-center gap-2 ${currentTheme.button.danger} px-6 py-2 rounded-lg transition-colors`}
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        로그아웃
      </button>
    </div>
  );
}
