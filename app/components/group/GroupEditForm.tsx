"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

interface GroupEditFormProps {
  group: {
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
  editedName: string;
  editedDescription: string;
  editedImage: File | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function GroupEditForm({
  group,
  editedName,
  editedDescription,
  editedImage,
  onNameChange,
  onDescriptionChange,
  onImageChange,
  onCancel,
  onSave,
}: GroupEditFormProps) {
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">그룹 이미지</label>
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
            onChange={onImageChange}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">그룹 이름</label>
        <input
          type="text"
          value={editedName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">설명</label>
        <textarea
          value={editedDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className={`${currentTheme.button.secondary} px-4 py-2 rounded-lg`}
        >
          취소
        </button>
        <button
          onClick={onSave}
          className={`${currentTheme.button.primary} px-4 py-2 rounded-lg`}
        >
          저장
        </button>
      </div>
    </div>
  );
}
