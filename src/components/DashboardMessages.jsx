"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, PawPrint } from "lucide-react";

// Compact inbox preview for the dashboard: recent conversations with
// WhatsApp-style unread badges, each opening the full chat at /messages.
export default function DashboardMessages() {
  const [conversations, setConversations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setConversations(Array.isArray(data.conversations) ? data.conversations : []);
    } catch {
      // keep the dashboard quiet if the inbox cannot load
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  if (!loaded) return null;

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-dark">
          Messages
          {totalUnread > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </h2>
        <Link
          href="/messages"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-[#b94b00] hover:underline"
        >
          Open inbox <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 text-sm text-light shadow-sm">
          <MessageCircle className="h-5 w-5 shrink-0 text-primary" />
          No conversations yet. Messages about your pets will appear here.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {conversations.slice(0, 6).map((conv) => (
            <Link
              key={`${conv.pet.id}:${conv.user.id}`}
              href={`/messages?pet=${conv.pet.id}&to=${conv.user.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fffaf5] hover:shadow-md"
            >
              {conv.pet.image ? (
                <img
                  src={conv.pet.image}
                  alt={conv.pet.name}
                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <PawPrint className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-dark">{conv.user.name}</span>
                <span className="block truncate text-xs font-medium text-primary">
                  About {conv.pet.name}
                </span>
                <span className="block truncate text-sm text-light">
                  {conv.lastMessage ? conv.lastMessage.text : "Start the conversation"}
                </span>
              </span>
              {conv.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                  {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
