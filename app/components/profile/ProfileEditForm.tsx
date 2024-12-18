"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface ProfileEditFormProps {
  user: {
    name: string;
    imageUrl: string | null;
  };
  editedName: string;
  editedImage: File | null;
  onNameChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function ProfileEditForm({
  user,
  editedName,
  editedImage,
  onNameChange,
  onImageChange,
  onCancel,
  onSave,
}: ProfileEditFormProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">프로필 이미지</label>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {(editedImage || user?.imageUrl) && (
              <Image
                src={
                  editedImage
                    ? URL.createObjectURL(editedImage)
                    : user?.imageUrl!
                }
                alt="Profile image"
                fill
                className="object-cover"
              />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            이미지 {user?.imageUrl ? "변경" : "추가"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">이름</label>
        <input
          type="text"
          value={editedName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          취소
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
        >
          저장
        </button>
      </div>
    </div>
  );
}
