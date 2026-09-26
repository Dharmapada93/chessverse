"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Send, MessageSquare, Shield, Smile, X, VolumeX, Plus } from "lucide-react";
import { socket } from "@/lib/socket";
import { apiFetch } from "@/lib/api";
import { ChatMessage, GameChatProps } from "./types";

const QUICK_REACTIONS = ["GG", "Nice move!", "Well played", "Good luck", "Thank you"];
const REACTION_EMOJIS = ["👍", "👏", "🔥", "😮", "GG"];

export default function GameChat({
  roomId,
  gameId,
  isSpectator = false,
  isMobileDrawer = false,
  onCloseDrawer,
  className = "",
}: GameChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set());
  const [lastSendTime, setLastSendTime] = useState(0);
  const [activeReactMessageId, setActiveReactMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadRestrictions() {
      try {
        const res = await apiFetch("/api/users/me/restrictions");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.mutedUserIds)) {
            setMutedUserIds(new Set(data.mutedUserIds));
          }
        }
      } catch {}
    }
    loadRestrictions();
  }, []);

  useEffect(() => {
    function handleMessage(payload: any) {
      if (payload.userId && mutedUserIds.has(payload.userId)) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: payload.id || Math.random().toString(),
          userId: payload.userId,
          username: payload.username || payload.name || "User",
          message: payload.message,
          role: payload.role || (isSpectator ? "spectator" : "player"),
          createdAt: payload.createdAt || new Date(),
          reactions: payload.reactions || {},
        },
      ]);
    }

    function handleReaction(payload: {
      messageId: string;
      reactions: Record<string, number>;
    }) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === payload.messageId
            ? { ...msg, reactions: payload.reactions }
            : msg
        )
      );
    }

    socket.on("chat:message", handleMessage);
    socket.on("game:chat", handleMessage);
    socket.on("chat:reaction", handleReaction);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("game:chat", handleMessage);
      socket.off("chat:reaction", handleReaction);
    };
  }, [mutedUserIds, isSpectator]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function sendRawMessage(text: string) {
    const clean = text.trim().slice(0, 300);
    if (!clean) return;

    // Rate limit: max 1 message per 800ms
    const now = Date.now();
    if (now - lastSendTime < 800) {
      return;
    }
    setLastSendTime(now);

    const payload = {
      roomId,
      gameId,
      message: clean,
      role: isSpectator ? "spectator" : "player",
    };

    socket.emit("chat:send", payload);
    socket.emit("game:chat", payload);
  }

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendRawMessage(input);
    setInput("");
  }

  function handleReact(messageId: string, emoji: string) {
    setActiveReactMessageId(null);
    socket.emit("chat:react", {
      roomId,
      gameId,
      messageId,
      emoji,
    });
  }

  return (
    <section className={`flex flex-col rounded-[14px] border border-[rgba(24,34,30,0.08)] bg-[#FBF9F3] dark:bg-[#21332B] dark:border-[rgba(255,255,255,0.08)] overflow-hidden shadow-xs text-[#18221E] dark:text-[#F4EFE3] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] px-4 py-2.5 bg-[#F7F4EC] dark:bg-[#1B2A24]">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-[#B58A3A] dark:text-[#D3AA58]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#18221E] dark:text-[#F4EFE3]">
            Room Chat
          </h3>
        </div>

        {isMobileDrawer && onCloseDrawer && (
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label="Close chat drawer"
            className="rounded-lg p-1 text-[#69736C] hover:bg-[#EDE9DE] hover:text-[#18221E] dark:text-[#B5BDB5] dark:hover:bg-[#13201B] dark:hover:text-[#F4EFE3] cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Message Stream */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 max-h-[280px] min-h-[160px] overflow-y-auto p-3 space-y-2.5 text-xs"
      >
        {messages.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center text-[#69736C]/70 dark:text-[#B5BDB5]/70">
            <p className="font-semibold text-[#18221E] dark:text-[#F4EFE3]">Welcome to match chat.</p>
            <p className="text-[11px] mt-1 text-[#69736C] dark:text-[#B5BDB5]">Be respectful and enjoy the game.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="group relative flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-[#18221E] dark:text-[#F4EFE3]">{m.username}</span>
                {m.role === "spectator" && (
                  <span className="rounded bg-[#EDE9DE] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] px-1 py-0.1 text-[9px] text-[#69736C] dark:text-[#B5BDB5] uppercase">
                    Spectator
                  </span>
                )}
                <span className="text-[9px] text-[#69736C] dark:text-[#B5BDB5] ml-auto font-mono">
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="break-words text-[#18221E] dark:text-[#F4EFE3] leading-relaxed">{m.message}</p>

                {/* Reaction button */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveReactMessageId(
                      activeReactMessageId === m.id ? null : m.id,
                    )
                  }
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#69736C] hover:text-[#18221E] dark:text-[#B5BDB5] dark:hover:text-[#F4EFE3] transition cursor-pointer"
                >
                  <Smile size={12} />
                </button>
              </div>

              {/* Reaction picker */}
              {activeReactMessageId === m.id && (
                <div className="flex items-center gap-1 p-1 bg-[#FBF9F3] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-lg w-fit mt-1 shadow-md animate-in fade-in zoom-in-95">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReact(m.id, emoji)}
                      className="px-1.5 py-0.5 hover:bg-[#F7F4EC] dark:hover:bg-[#21332B] rounded text-xs transition cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Reactions display */}
              {m.reactions && Object.keys(m.reactions).length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {Object.entries(m.reactions).map(([emoji, count]) =>
                    count > 0 ? (
                      <span
                        key={emoji}
                        className="inline-flex items-center gap-1 rounded-md bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 text-[10px] text-[#18221E] dark:text-[#F4EFE3]"
                      >
                        <span>{emoji}</span>
                        <span className="font-mono text-[9px] text-[#69736C] dark:text-[#B5BDB5]">{count}</span>
                      </span>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Responses */}
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#F7F4EC] dark:bg-[#1B2A24]">
        {QUICK_REACTIONS.map((qr) => (
          <button
            key={qr}
            type="button"
            onClick={() => sendRawMessage(qr)}
            className="shrink-0 rounded-full border border-[rgba(24,34,30,0.1)] dark:border-[rgba(255,255,255,0.1)] bg-[#FBF9F3] dark:bg-[#21332B] px-2.5 py-0.5 text-[10px] text-[#69736C] dark:text-[#B5BDB5] hover:bg-[#EDE9DE] hover:text-[#18221E] dark:hover:bg-[#13201B] dark:hover:text-[#F4EFE3] transition cursor-pointer shadow-xs"
          >
            {qr}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[rgba(24,34,30,0.08)] dark:border-[rgba(255,255,255,0.08)] p-2.5 bg-[#FBF9F3] dark:bg-[#21332B]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isSpectator ? "Chat as spectator..." : "Message opponent or spectators..."}
          maxLength={300}
          className="flex-1 bg-[#F7F4EC] dark:bg-[#1B2A24] border border-[rgba(24,34,30,0.12)] dark:border-[rgba(255,255,255,0.12)] rounded-[12px] px-3 py-1.5 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C]/50 dark:placeholder-[#B5BDB5]/50 focus:outline-none focus:border-[#B58A3A] transition"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send message"
          className="rounded-[12px] bg-[#18352B] hover:bg-[#285443] text-[#F7F4EC] dark:bg-[#D3AA58] dark:hover:bg-[#B58A3A] dark:text-[#13201B] disabled:opacity-40 p-2 transition cursor-pointer shadow-xs"
        >
          <Send size={13} />
        </button>
      </form>
    </section>
  );
}
