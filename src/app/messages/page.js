"use client";

import { Suspense, Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  PawPrint,
  Send,
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
];

function avatarColor(name) {
  if (!name) return "bg-gray-500";
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const startOfDay = (value) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function listTimestamp(timestamp) {
  if (!timestamp) return "";
  const label = dayLabel(timestamp);
  return label === "Today" ? formatTime(timestamp) : label === "Yesterday" ? "Yesterday" : label;
}

function UnreadBadge({ count, className = "" }) {
  if (!count) return null;
  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white ${className}`}
      aria-label={`${count} unread messages`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Avatar({ name, avatar, sizeClass = "h-11 w-11", textClass = "text-base" }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || "User"}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      className={`${sizeClass} ${textClass} ${avatarColor(name)} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      aria-hidden
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function PetThumb({ pet, sizeClass = "h-12 w-12" }) {
  const [failed, setFailed] = useState(false);
  if (!pet?.image || failed) {
    return (
      <span
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-xl bg-secondary text-primary`}
      >
        <PawPrint className="h-5 w-5" />
      </span>
    );
  }
  return (
    <img
      src={pet.image}
      alt={pet.name || "Pet"}
      onError={() => setFailed(true)}
      className={`${sizeClass} shrink-0 rounded-xl object-cover`}
    />
  );
}

function MessagesInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPet = searchParams.get("pet");
  const initialTo = searchParams.get("to");

  const [viewer] = useState(() =>
    typeof window === "undefined" ? null : JSON.parse(localStorage.getItem("user") || "null")
  );
  const viewerId = viewer?.id || viewer?._id || "";

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [active, setActive] = useState(null); // { petId, otherId }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const scrollContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevCountRef = useRef(0);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadConversations = useCallback(async () => {
    const params = new URLSearchParams();
    if (initialPet) params.set("pet", initialPet);
    if (initialTo) params.set("to", initialTo);
    const query = params.toString();
    const res = await fetch(`/api/messages/conversations${query ? `?${query}` : ""}`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load conversations.");
    const list = Array.isArray(data.conversations) ? data.conversations : [];
    setConversations(list);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPet, initialTo]);

  const loadMessages = useCallback(async (petId, otherId, { silent = true } = {}) => {
    try {
      const res = await fetch(`/api/messages?pet=${petId}&receiver=${otherId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load this conversation.");
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      // The server marks this thread as read — clear its badge locally too.
      setConversations((current) =>
        current.map((conv) =>
          conv.pet.id === petId && conv.user.id === otherId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      if (!silent) toast.error(error.message || "Unable to load this conversation.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConversation = useCallback(
    (conv) => {
      setActive({ petId: conv.pet.id, otherId: conv.user.id });
      setMessages([]);
      prevCountRef.current = 0;
    },
    []
  );

  // Initial load: require auth, fetch conversations, open the deep-linked one.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      const query = searchParams.toString();
      router.replace(`/login?next=${encodeURIComponent(`/messages${query ? `?${query}` : ""}`)}`);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const list = await loadConversations();
        if (cancelled) return;
        let target = null;
        if (initialPet && initialTo) {
          target = list.find((conv) => conv.pet.id === initialPet && conv.user.id === initialTo);
        }
        if (!target && initialPet) {
          target = list.find((conv) => conv.pet.id === initialPet);
        }
        if (!target && window.innerWidth >= 768) {
          target = list[0];
        }
        if (target) setActive({ petId: target.pet.id, otherId: target.user.id });
      } catch (error) {
        if (!cancelled) setListError(error.message || "Unable to load conversations.");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the inbox list fresh (new conversations, unread badges, ordering).
  useEffect(() => {
    if (loadingList) return;
    const interval = setInterval(() => {
      loadConversations().catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [loadingList, loadConversations]);

  // Poll the open conversation for new messages (near-real-time delivery).
  useEffect(() => {
    if (!active) return;
    setLoadingMessages(true);
    loadMessages(active.petId, active.otherId, { silent: false }).finally(() =>
      setLoadingMessages(false)
    );
    const interval = setInterval(() => {
      loadMessages(active.petId, active.otherId);
    }, 3000);
    return () => clearInterval(interval);
  }, [active, loadMessages]);

  // Auto-scroll: jump to the bottom on open, follow new messages when near the bottom.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;
    const isInitial = prevCountRef.current === 0;
    const grew = messages.length > prevCountRef.current;
    prevCountRef.current = messages.length;
    if (isInitial) {
      container.scrollTop = container.scrollHeight;
      return;
    }
    if (!grew) return;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 140;
    const lastIsMine = messages[messages.length - 1]?.sender === viewerId;
    if (nearBottom || lastIsMine) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, viewerId]);

  const activeConv = active
    ? conversations.find((conv) => conv.pet.id === active.petId && conv.user.id === active.otherId) ||
      null
    : null;

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || !active) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ receiver: active.otherId, pet: active.petId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message.");
      setMessages((current) => [...current, data.message]);
      setDraft("");
      loadConversations().catch(() => {});
    } catch (error) {
      toast.error(error.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary px-3 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="section-kicker mb-1">PetHouse chat</p>
            <h1 className="font-heading text-3xl font-bold text-dark">Messages</h1>
          </div>
          {totalUnread > 0 && (
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-dark shadow-sm">
              Unread <UnreadBadge count={totalUnread} />
            </span>
          )}
        </header>

        <div className="flex h-[calc(100dvh-230px)] min-h-[520px] overflow-hidden rounded-[1.5rem] border border-[#ebe7df] bg-white shadow-sm">
          {/* Conversation list */}
          <aside
            className={`${active ? "hidden md:flex" : "flex"} w-full flex-col md:w-[340px] md:shrink-0 md:border-r md:border-[#f0ece4]`}
          >
            <div className="flex items-center justify-between border-b border-[#f0ece4] px-5 py-4">
              <h2 className="font-heading text-lg font-bold text-dark">Chats</h2>
              <UnreadBadge count={totalUnread} />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingList ? (
                <p className="mt-12 text-center text-sm text-light">Loading conversations...</p>
              ) : listError ? (
                <p className="mt-12 px-6 text-center text-sm text-red-600">{listError}</p>
              ) : conversations.length === 0 ? (
                <div className="mt-14 px-6 text-center">
                  <MessageCircle className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <p className="font-semibold text-dark">No conversations yet</p>
                  <p className="mt-1 text-sm text-light">
                    Browse adoptable pets and tap &quot;Chat with Owner&quot; to start one.
                  </p>
                  <Link href="/pets" className="btn-primary mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm">
                    Browse Pets
                  </Link>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive =
                    active?.petId === conv.pet.id && active?.otherId === conv.user.id;
                  const lastIsMine = conv.lastMessage?.senderId === viewerId;
                  return (
                    <button
                      key={`${conv.pet.id}:${conv.user.id}`}
                      type="button"
                      onClick={() => openConversation(conv)}
                      className={`flex w-full items-center gap-3 border-b border-[#f6f2ea] px-4 py-3 text-left transition-colors hover:bg-[#faf7f1] ${
                        isActive ? "bg-[#fff1e6]" : ""
                      }`}
                    >
                      <PetThumb pet={conv.pet} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-dark">{conv.user.name}</span>
                          <span className="shrink-0 text-[11px] text-light">
                            {listTimestamp(conv.lastMessage?.createdAt)}
                          </span>
                        </span>
                        <span className="block truncate text-xs font-medium text-primary">
                          {conv.pet.name}
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className="truncate text-sm text-light">
                            {conv.lastMessage
                              ? `${lastIsMine ? "You: " : ""}${conv.lastMessage.text}`
                              : "Start the conversation"}
                          </span>
                          <UnreadBadge count={conv.unreadCount} className="shrink-0" />
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat panel */}
          <section className={`${active ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
            {!activeConv ? (
              <div className="flex flex-1 flex-col items-center justify-center bg-[#faf7f1] px-6 text-center">
                <MessageCircle className="mb-3 h-12 w-12 text-primary/50" />
                <p className="font-heading text-lg font-bold text-dark">Select a conversation</p>
                <p className="mt-1 text-sm text-light">
                  Pick a chat from the list to read and reply to messages.
                </p>
              </div>
            ) : (
              <>
                {/* Chat header: pet + other participant */}
                <div className="flex items-center gap-3 border-b border-[#f0ece4] bg-white px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="rounded-full p-2 text-dark transition-colors hover:bg-[#FF9B55] hover:text-black md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar
                    name={activeConv.user.name}
                    avatar={activeConv.user.avatar}
                    sizeClass="h-10 w-10"
                    textClass="text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-dark">{activeConv.user.name}</p>
                    <p className="text-xs capitalize text-light">
                      {activeConv.user.role === "shelter" ? "Pet owner" : activeConv.user.role}
                    </p>
                  </div>
                  <Link
                    href={`/pets/${activeConv.pet.id}`}
                    className="flex min-w-0 items-center gap-2 rounded-full border border-[#f0e9df] bg-secondary py-1.5 pl-1.5 pr-3 transition-colors hover:border-[#ffbd8a] hover:bg-[#fff1e6]"
                  >
                    <PetThumb pet={activeConv.pet} sizeClass="h-8 w-8" />
                    <span className="max-w-[90px] truncate text-xs font-semibold text-dark sm:max-w-[140px]">
                      {activeConv.pet.name}
                    </span>
                  </Link>
                </div>

                {/* Messages */}
                <div
                  ref={scrollContainerRef}
                  className="flex-1 space-y-3 overflow-y-auto bg-[#efe9df] px-4 py-4"
                >
                  {loadingMessages && messages.length === 0 ? (
                    <p className="mt-10 text-center text-sm text-light">Loading conversation...</p>
                  ) : messages.length === 0 ? (
                    <p className="mt-10 text-center text-sm text-light">
                      No messages yet. Say hello to {activeConv.user.name}!
                    </p>
                  ) : (
                    messages.map((message, index) => {
                      const isMine = message.sender === viewerId;
                      const label = dayLabel(message.createdAt);
                      const prevLabel =
                        index > 0 ? dayLabel(messages[index - 1].createdAt) : null;
                      return (
                        <Fragment key={message._id}>
                          {label !== prevLabel && (
                            <div className="flex justify-center py-1">
                              <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-light shadow-sm">
                                {label}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[70%] ${
                                isMine
                                  ? "rounded-br-sm bg-primary text-white"
                                  : "rounded-bl-sm bg-white text-dark"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.text}</p>
                              <p
                                className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                  isMine ? "text-white/75" : "text-light"
                                }`}
                              >
                                {formatTime(message.createdAt)}
                                {isMine &&
                                  (message.readAt ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-sky-300" aria-label="Read" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" aria-label="Sent" />
                                  ))}
                              </p>
                            </div>
                          </div>
                        </Fragment>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Composer */}
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 border-t border-[#f0ece4] bg-white p-3"
                >
                  <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={`Message ${activeConv.user.name} about ${activeConv.pet.name}...`}
                    maxLength={2000}
                    className="input-field flex-1 border-none bg-secondary py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="rounded-xl bg-primary p-3 text-white transition hover:bg-primary-hover hover:text-dark disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-light">
          Loading messages...
        </div>
      }
    >
      <MessagesInbox />
    </Suspense>
  );
}
