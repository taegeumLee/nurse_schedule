"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp } from "@/app/utils/animations";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/app/styles/theme";
import Toast from "@/app/components/Toast";
import GroupHeader from "@/app/components/group/GroupHeader";
import GroupEditForm from "@/app/components/group/GroupEditForm";
import GroupCalendar from "@/app/components/group/GroupCalendar";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/app/lib/firebase";

interface Schedule {
  id: string;
  userId: string;
  userName: string;
  date: string;
  shiftType: string;
}

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

const defaultShiftColors = {
  DAY: "#4CAF50",
  EVENING: "#2196F3",
  NIGHT: "#9C27B0",
  OFF: "#757575",
};

export default function GroupDetailPage() {
  const params = useParams();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedImage, setEditedImage] = useState<File | null>(null);
  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [shiftColors, setShiftColors] = useState(defaultShiftColors);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!params?.id) return;

      try {
        const res = await fetch(`/api/groups/${params.id}`);
        if (!res.ok) {
          throw new Error("그룹 정보를 불러올 수 없습니다.");
        }
        const data = await res.json();
        setGroup(data);
        setEditedName(data.name);
        setEditedDescription(data.description || "");
      } catch (error) {
        console.error(error);
        alert("그룹 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroup();
  }, [params?.id]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!group?.members) return;

      try {
        const memberIds = group.members.map((member) => member.id);
        const res = await fetch(
          `/api/schedules/group?memberIds=${memberIds.join(",")}`
        );
        if (!res.ok) throw new Error("스케줄을 불러올 수 없습니다.");
        const data = await res.json();
        setSchedules(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (group) {
      fetchSchedules();
    }
  }, [group]);

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
      formData.append("description", editedDescription);

      if (editedImage) {
        const storageRef = ref(storage, `groups/${params.id}/${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, editedImage);
        const downloadURL = await getDownloadURL(snapshot.ref);
        formData.append("imageUrl", downloadURL);
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
        <GroupHeader
          group={group}
          onCopyInviteCode={handleCopyInviteCode}
          onEditClick={() => {
            setIsEditing(true);
            setEditedName(group.name);
            setEditedDescription(group.description || "");
          }}
          isEditing={isEditing}
        />

        {isEditing ? (
          <GroupEditForm
            group={group}
            editedName={editedName}
            editedDescription={editedDescription}
            editedImage={editedImage}
            onNameChange={setEditedName}
            onDescriptionChange={setEditedDescription}
            onImageChange={handleImageChange}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
          />
        ) : (
          <>
            {group?.description && (
              <p className={`mb-6 ${currentTheme.text.secondary}`}>
                {group.description}
              </p>
            )}
            <GroupCalendar schedules={schedules} shiftColors={shiftColors} />
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
