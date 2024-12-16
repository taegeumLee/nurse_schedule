"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { slideUp } from "@/app/utils/animations";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  members: {
    id: string;
    name: string;
  }[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`/api/groups/${params.id}`);
        if (!res.ok) {
          throw new Error("그룹 정보를 불러올 수 없습니다.");
        }
        const data = await res.json();
        setGroup(data);
      } catch (error) {
        console.error(error);
        alert("그룹 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchGroup();
    }
  }, [params.id]);

  if (isLoading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (!group) {
    return <div className="p-4">그룹을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="p-4">
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`${currentTheme.background.card} backdrop-blur-sm rounded-xl shadow-lg p-6`}
      >
        <h1 className={`text-2xl font-bold mb-4 ${currentTheme.text.primary}`}>
          {group.name}
        </h1>
        {group.description && (
          <p className={`mb-6 ${currentTheme.text.secondary}`}>
            {group.description}
          </p>
        )}

        <div className={`mt-6 p-4 rounded-lg ${currentTheme.background.card}`}>
          <h2
            className={`text-lg font-semibold mb-2 ${currentTheme.text.primary}`}
          >
            초대 코드
          </h2>
          <div className="flex items-center gap-2">
            <code
              className={`px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 ${currentTheme.text.primary}`}
            >
              {group.inviteCode}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(group.inviteCode);
                alert("초대 코드가 클립보드에 복사되었습니다.");
              }}
              className={`${currentTheme.button.secondary} px-3 py-2 rounded-lg text-sm`}
            >
              복사
            </button>
          </div>
          <p className={`mt-2 text-sm ${currentTheme.text.tertiary}`}>
            이 코드를 공유하여 다른 사람을 그룹에 초대할 수 있습니다.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
