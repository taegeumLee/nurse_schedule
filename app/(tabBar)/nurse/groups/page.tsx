"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { slideUp } from "@/app/utils/animations";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";
import Image from "next/image";

interface Group {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  members: {
    id: string;
    name: string;
  }[];
  imageUrl?: string;
}

interface UserInfo {
  id: string;
  name: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("/api/groups");
        if (!res.ok) {
          throw new Error("그룹 목록을 가져올 수 없습니다.");
        }
        const data = await res.json();
        setGroups(data);
        setIsLoading(true);
      } catch (error) {
        console.error(error);
        alert("그룹 목록을 가져오는데 실패했습니다.");
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) throw new Error("사용자 정보를 가져올 수 없습니다.");
        const data = await res.json();
        setUserInfo(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      alert("초대 코드를 입력해주세요.");
      return;
    }

    setIsJoining(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "그룹 참여에 실패했습니다.");
      }

      const data = await res.json();
      setShowJoinModal(false);
      setInviteCode("");
      // TODO: 그룹 목록 새로고침
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "그룹 참여에 실패했습니다."
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="p-4">
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`${currentTheme.background.card} backdrop-blur-sm rounded-xl shadow-lg p-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${currentTheme.text.primary}`}>
            그룹 듀티
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoinModal(true)}
              className={`${currentTheme.button.secondary} px-4 py-2 rounded-lg`}
            >
              그룹 참여
            </button>
            <Link
              href="/nurse/groups/create"
              className={`${currentTheme.button.primary} px-4 py-2 rounded-lg`}
            >
              그룹 만들기
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`block ${currentTheme.background.card} p-4 rounded-lg hover:bg-opacity-90 transition-colors`}
            >
              <Link
                href={`/nurse/groups/${group.id}`}
                className="flex justify-between items-start p-2 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {group.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={group.imageUrl}
                        alt={group.name}
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div>
                    <h3
                      className={`font-semibold text-lg ${currentTheme.text.primary}`}
                    >
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className={currentTheme.text.secondary}>
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`${currentTheme.text.tertiary} relative text-sm flex flex-col`}
                >
                  <span className="absolute top-5 right-0">
                    멤버 {group.memberCount}명
                  </span>
                  <div className="flex flex-wrap">
                    {group.members.map((member) => (
                      <span
                        key={member.id}
                        className={`inline-flex items-center pl-1.5 py-1 rounded-md text-xs font-medium ${currentTheme.background.card}`}
                      >
                        {member.name === userInfo?.name ? "나" : member.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div
              className={`${currentTheme.background.card} rounded-xl p-6 w-full max-w-md`}
            >
              <h2
                className={`text-xl font-bold mb-4 ${currentTheme.text.primary}`}
              >
                그룹 참여
              </h2>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="초대 코드를 입력하세요"
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setInviteCode("");
                  }}
                  className={`${currentTheme.button.secondary} px-4 py-2 rounded-lg`}
                >
                  취소
                </button>
                <button
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                  className={`${currentTheme.button.primary} px-4 py-2 rounded-lg disabled:opacity-50`}
                >
                  {isJoining ? "참여 중..." : "참여하기"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
