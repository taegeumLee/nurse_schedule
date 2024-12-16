"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp } from "@/app/utils/animations";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";
import Toast from "@/app/components/Toast";
import Image from "next/image";

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  inviteCode: string;
  members: {
    id: string;
    name: string;
  }[];
}

export default function GroupDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedImage, setEditedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleCopyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setShowToast(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setEditedImage(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editedName);
      formData.append("description", editedDescription || "");
      if (editedImage) {
        formData.append("image", editedImage);
      }

      const res = await fetch(`/api/groups/${params.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("그룹 정보 수정에 실패했습니다.");

      const updatedGroup = await res.json();
      setGroup(updatedGroup);
      setIsEditing(false);
      setShowToast(true);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "수정에 실패했습니다.");
    }
  };

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
        className={`${currentTheme.background.card} backdrop-blur-sm rounded-xl shadow-lg p-3`}
      >
        <div className="flex justify-between items-center mb-4 gap-2">
          <h1 className={`text-2xl font-bold ${currentTheme.text.primary}`}>
            {group?.name}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyInviteCode}
              className={`${currentTheme.button.secondary} px-3 py-1.5 rounded-lg text-xs flex items-center gap-1`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            </button>

            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedName(group.name);
                  setEditedDescription(group.description || "");
                }}
                className={`${currentTheme.button.secondary} px-3 py-1.5 rounded-lg flex items-center gap-2`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                그룹 이미지
              </label>
              <div className="flex items-center gap-4">
                {(editedImage || group?.imageUrl) && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      src={
                        editedImage
                          ? URL.createObjectURL(editedImage)
                          : group?.imageUrl!
                      }
                      alt="Group image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`${currentTheme.button.secondary} px-4 py-2 rounded-lg`}
                >
                  이미지 {group?.imageUrl ? "변경" : "추가"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                그룹 이름
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">설명</label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className={`${currentTheme.button.secondary} px-4 py-2 rounded-lg`}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className={`${currentTheme.button.primary} px-4 py-2 rounded-lg`}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            {group?.imageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6">
                <Image
                  src={group.imageUrl}
                  alt={group.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {group?.description && (
              <p className={`mb-6 ${currentTheme.text.secondary}`}>
                {group.description}
              </p>
            )}
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {showToast && (
          <Toast
            message={
              isEditing
                ? "그룹 정보가 수정되었습니다"
                : "초대 코드가 복사되었습니다"
            }
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
