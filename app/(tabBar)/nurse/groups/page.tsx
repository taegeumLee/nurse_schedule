"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { slideUp } from "@/app/utils/animations";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

interface Group {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    // TODO: API 구현 후 그룹 목록 가져오기
  }, []);

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
            근무 그룹
          </h1>
          <Link
            href="/nurse/groups/create"
            className={`${currentTheme.button.primary} px-4 py-2 rounded-lg`}
          >
            그룹 만들기
          </Link>
        </div>

        <div className="space-y-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/nurse/groups/${group.id}`}
              className={`block ${currentTheme.background.card} p-4 rounded-lg hover:bg-opacity-90 transition-colors`}
            >
              <div className="flex justify-between items-center">
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
                <div className={currentTheme.text.tertiary}>
                  멤버 {group.memberCount}명
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
