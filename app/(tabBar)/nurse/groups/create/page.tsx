"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { slideUp } from "@/app/utils/animations";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        throw new Error("그룹 생성에 실패했습니다.");
      }

      const data = await res.json();
      router.push(`/nurse/groups/${data.id}?code=${data.inviteCode}`);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "그룹 생성에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
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
        <h1 className={`text-2xl font-bold mb-6 ${currentTheme.text.primary}`}>
          새 그룹 만들기
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className={`block mb-2 ${currentTheme.text.secondary}`}
            >
              그룹 이름
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className={`block mb-2 ${currentTheme.text.secondary}`}
            >
              설명 (선택사항)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className={`${currentTheme.button.secondary} px-4 py-2 rounded-lg`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`${currentTheme.button.primary} px-4 py-2 rounded-lg disabled:opacity-50`}
            >
              {isLoading ? "생성 중..." : "생성하기"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
