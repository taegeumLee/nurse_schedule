"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";

interface GroupHeaderProps {
  group: {
    imageUrl: string | null;
    name: string;
    inviteCode: string;
  };
  onCopyInviteCode: () => void;
  onEditClick: () => void;
  isEditing: boolean;
}

export default function GroupHeader({
  group,
  onCopyInviteCode,
  onEditClick,
  isEditing,
}: GroupHeaderProps) {
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  return (
    <div className="flex justify-between items-center mb-4 gap-2">
      <div className="flex items-center gap-2">
        {group?.imageUrl && (
          <div className="w-12 h-12 rounded-lg overflow-hidden">
            <Image
              src={group.imageUrl}
              alt={group.name}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
        )}
        <h1 className={`text-2xl font-bold ${currentTheme.text.primary}`}>
          {group?.name}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCopyInviteCode}
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
            onClick={onEditClick}
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
  );
}
