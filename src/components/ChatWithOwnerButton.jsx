"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

// "Chat with Owner" entry point. Hidden for the pet's owner and for
// shelter/admin viewers; guests are sent to login first.
export default function ChatWithOwnerButton({
  petId,
  ownerId,
  ownerName = "Owner",
  className = "",
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      setVisible(true); // guest — click redirects to login
      return;
    }
    try {
      const viewer = JSON.parse(raw);
      const viewerId = String(viewer.id || viewer._id || "");
      setVisible(viewer.role === "user" && viewerId !== String(ownerId));
    } catch {
      setVisible(true);
    }
  }, [ownerId]);

  if (!visible || !petId || !ownerId) return null;

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const target = `/messages?pet=${petId}&to=${ownerId}`;
    if (!localStorage.getItem("token")) {
      toast.error("Please login to chat with the owner");
      router.push(`/login?next=${encodeURIComponent(target)}`);
      return;
    }
    router.push(target);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Chat with ${ownerName} about this pet`}
      title={`Chat with ${ownerName}`}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-md transition hover:bg-primary hover:text-white ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
    </button>
  );
}
