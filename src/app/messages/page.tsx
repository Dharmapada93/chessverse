"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Send,
  Trash2,
  Check,
  CheckCheck,
  ArrowLeft,
  MessageSquare,
  Search,
  Loader2,
  Clock,
  MoreVertical,
  ShieldAlert,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import OnlineStatus from "@/components/friends/OnlineStatus";
import {
  chatService,
  socialService,
  type ConversationItem,
  type DirectMessageItem,
} from "@/services/social";

function formatMessageTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUserId = searchParams?.get("userId") ?? null;

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialUserId);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadScrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations
  async function loadConversations() {
    setIsLoadingConversations(true);
    try {
      const convs = await chatService.fetchConversations();
      setConversations(convs);

      // If activePartnerId is set but not in convs, fetch partner profile
      if (initialUserId && !convs.some((c) => c.partnerId === initialUserId)) {
        // Can be a new chat
      }
    } finally {
      setIsLoadingConversations(false);
    }
  }

  // Load messages for active partner
  async function loadMessagesForPartner(partnerId: string) {
    setIsLoadingMessages(true);
    try {
      const res = await chatService.fetchMessages(partnerId);
      setMessages(res.messages);
      setHasMoreOlder(res.hasMore);
      await chatService.markConversationRead(partnerId);

      // Decrement unread count locally
      setConversations((prev) =>
        prev.map((c) => (c.partnerId === partnerId ? { ...c, unreadCount: 0 } : c)),
      );
    } finally {
      setIsLoadingMessages(false);
    }
  }

  // Load older messages on scroll-up (R4.37)
  async function loadOlderMessages() {
    if (!activePartnerId || isLoadingOlder || !hasMoreOlder || messages.length === 0) return;
    const oldestTimestamp = messages[0].createdAt;
    setIsLoadingOlder(true);
    try {
      const res = await chatService.fetchMessages(activePartnerId, oldestTimestamp);
      if (res.messages.length > 0) {
        setMessages((prev) => [...res.messages, ...prev]);
        setHasMoreOlder(res.hasMore);
      } else {
        setHasMoreOlder(false);
      }
    } finally {
      setIsLoadingOlder(false);
    }
  }

  useEffect(() => {
    loadConversations();

    // Subscribe to realtime messages (R4.36)
    const unsubMsg = chatService.subscribeToMessages((newMsg) => {
      setMessages((prev) => {
        if (
          (newMsg.senderId === activePartnerId || newMsg.recipientId === activePartnerId) &&
          !prev.some((m) => m._id === newMsg._id)
        ) {
          return [...prev, newMsg];
        }
        return prev;
      });

      // Update conversations list snippet
      setConversations((prev) => {
        const isCurrentActive = newMsg.senderId === activePartnerId;
        return prev.map((c) => {
          if (c.partnerId === newMsg.senderId || c.partnerId === newMsg.recipientId) {
            return {
              ...c,
              lastMessage: {
                id: newMsg._id,
                text: newMsg.message,
                senderId: newMsg.senderId,
                createdAt: newMsg.createdAt,
                read: newMsg.read,
              },
              unreadCount: isCurrentActive ? c.unreadCount : c.unreadCount + 1,
            };
          }
          return c;
        });
      });
    });

    // Subscribe to typing indicators (R4.38)
    const unsubTyping = chatService.subscribeToTyping((data) => {
      if (data.senderId === activePartnerId) {
        setPartnerTyping(data.isTyping);
      }
    });

    return () => {
      unsubMsg();
      unsubTyping();
    };
  }, [activePartnerId]);

  useEffect(() => {
    if (activePartnerId) {
      loadMessagesForPartner(activePartnerId);
    }
  }, [activePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing debounce
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputText(val);

    if (activePartnerId && !isTyping) {
      setIsTyping(true);
      chatService.sendTypingIndicator(activePartnerId, true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (activePartnerId) {
        setIsTyping(false);
        chatService.sendTypingIndicator(activePartnerId, false);
      }
    }, 1500);
  }

  // Send message
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activePartnerId || !inputText.trim()) return;

    const text = inputText.trim();
    setInputText("");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    chatService.sendTypingIndicator(activePartnerId, false);

    const res = await chatService.sendMessage(activePartnerId, text);
    if (res.success && res.message) {
      const sentMsg = res.message;
      setMessages((prev) => (prev.some((m) => m._id === sentMsg._id) ? prev : [...prev, sentMsg]));
      loadConversations();
    }
  }

  // Delete message
  async function handleDeleteMessage(messageId: string) {
    const res = await chatService.deleteMessage(messageId);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    }
  }

  const activeConv = conversations.find((c) => c.partnerId === activePartnerId);

  const filteredConversations = conversations.filter((c) =>
    c.partner.username.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <div className="min-h-screen text-[var(--color-text)] flex flex-col">
      <AppHeader />
      <div className="flex-1 flex">
        <AppSidebar />
        <main className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-2 sm:p-4">
          <div className="flex-1 flex rounded-[20px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[var(--color-border)] shadow-xl overflow-hidden backdrop-blur-md">
            {/* Left Column: Conversations List */}
            <div
              className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60 ${
                activePartnerId ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="p-3.5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-[#B58A3A]" />
                  <h2 className="text-sm font-serif font-bold text-[var(--color-text)]">Direct Messages</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-[12px] bg-[#FBF9F3] dark:bg-[#13201B] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[#B58A3A]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
                {isLoadingConversations ? (
                  <div className="p-6 text-center text-xs text-[var(--color-text-secondary)] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#B58A3A]" />
                    <span>Loading chats...</span>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                    No active conversations. Start a chat from your friends list!
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.partnerId}
                      onClick={() => setActivePartnerId(conv.partnerId)}
                      className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors ${
                        activePartnerId === conv.partnerId
                          ? "bg-[#EDE9DE] dark:bg-[#283E34] border-l-2 border-[#B58A3A]"
                          : "hover:bg-[#EDE9DE]/50 dark:hover:bg-[#1B2A24]/80"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#EDE9DE] dark:bg-[#18352B] flex items-center justify-center text-xs font-semibold text-[#18352B] dark:text-[#D3AA58]">
                          {conv.partner.avatar ? (
                            <img
                              src={conv.partner.avatar}
                              alt={conv.partner.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            conv.partner.username.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        {conv.partner.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#27815D] ring-2 ring-[#F7F4EC] dark:ring-[#1B2A24]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-[var(--color-text)] truncate">
                            {conv.partner.username}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                            {formatMessageTime(conv.lastMessage.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[180px]">
                            {conv.lastMessage.text}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[#B58A3A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Active Conversation Pane */}
            <div
              className={`flex-1 flex flex-col bg-[#FBF9F3] dark:bg-[#21332B] ${
                !activePartnerId ? "hidden md:flex items-center justify-center" : "flex"
              }`}
            >
              {!activePartnerId ? (
                <div className="text-center p-8 text-[var(--color-text-secondary)] max-w-sm">
                  <div className="w-12 h-12 rounded-[14px] bg-[#EDE9DE] dark:bg-[#1B2A24] flex items-center justify-center mx-auto mb-3 text-[#B58A3A]">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[var(--color-text)]">Your Messages</h3>
                  <p className="text-xs mt-1 text-[var(--color-text-secondary)] leading-relaxed">
                    Select a conversation from the left or message a friend to start chatting.
                  </p>
                </div>
              ) : (
                <>
                  {/* Chat Pane Header */}
                  <div className="p-3.5 px-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[#F7F4EC]/80 dark:bg-[#1B2A24]/80">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActivePartnerId(null)}
                        className="md:hidden p-1 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[#EDE9DE] dark:hover:bg-[#18352B]"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#EDE9DE] dark:bg-[#18352B] flex items-center justify-center text-xs font-semibold text-[#18352B] dark:text-[#D3AA58]">
                          {activeConv?.partner.avatar ? (
                            <img
                              src={activeConv.partner.avatar}
                              alt={activeConv.partner.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            activeConv?.partner.username?.slice(0, 2).toUpperCase() || "PL"
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-2">
                            <span>{activeConv?.partner.username || "Player"}</span>
                            <span className="text-[11px] text-[#B58A3A] font-mono">
                              ({activeConv?.partner.rating || 1200})
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--color-text-secondary)]">
                            {partnerTyping ? (
                              <span className="text-[#B58A3A] font-medium animate-pulse">
                                typing...
                              </span>
                            ) : (
                              <span>{activeConv?.partner.online ? "Online" : "Offline"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/player/${activeConv?.partner.username}`)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-[12px] bg-[#18352B] text-[#FBF9F3] hover:bg-[#285443] dark:bg-[#D3AA58] dark:text-[#18221E] transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>

                  {/* Messages Scroll Thread with Scroll-up Pagination */}
                  <div
                    ref={threadScrollRef}
                    onScroll={(e) => {
                      if (e.currentTarget.scrollTop === 0 && hasMoreOlder) {
                        loadOlderMessages();
                      }
                    }}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                  >
                    {hasMoreOlder && (
                      <div className="text-center pb-2">
                        <button
                          onClick={loadOlderMessages}
                          disabled={isLoadingOlder}
                          className="text-[11px] text-[var(--color-text-secondary)] hover:text-[#B58A3A] px-3 py-1 rounded-[12px] bg-[#EDE9DE] dark:bg-[#1B2A24] border border-[var(--color-border)]"
                        >
                          {isLoadingOlder ? "Loading older messages..." : "Load older messages"}
                        </button>
                      </div>
                    )}

                    {isLoadingMessages ? (
                      <div className="p-8 text-center text-xs text-[var(--color-text-secondary)] flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#B58A3A]" />
                        <span>Loading messages...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                        No messages yet. Say hello to start the conversation!
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId !== activePartnerId;
                        return (
                          <div
                            key={msg._id}
                            className={`flex flex-col group ${isMe ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`relative max-w-sm sm:max-w-md px-3.5 py-2 rounded-[14px] text-xs leading-relaxed ${
                                isMe
                                  ? "bg-[#18352B] text-[#FBF9F3] dark:bg-[#285443] rounded-tr-none shadow-sm"
                                  : "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[var(--color-text)] border border-[var(--color-border)] rounded-tl-none shadow-sm"
                              }`}
                            >
                              <p className="break-words">{msg.message}</p>

                              <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                                isMe ? "text-[#EDE9DE]/70" : "text-[var(--color-text-secondary)]"
                              }`}>
                                <span>{formatMessageTime(msg.createdAt)}</span>
                                {isMe && (
                                  <span>
                                    {msg.read ? (
                                      <CheckCheck className="w-3 h-3 text-[#D6B66A]" />
                                    ) : (
                                      <Check className="w-3 h-3 text-[#EDE9DE]/70" />
                                    )}
                                  </span>
                                )}
                              </div>

                              {isMe && (
                                <button
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-[var(--color-text-secondary)] hover:text-[#A94B45] transition-opacity"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Bar */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 border-t border-[var(--color-border)] bg-[#F7F4EC]/80 dark:bg-[#1B2A24]/80 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      maxLength={500}
                      placeholder="Type a message (max 500 chars)..."
                      className="flex-1 px-3.5 py-2 rounded-[12px] bg-[#FBF9F3] dark:bg-[#13201B] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[#B58A3A]"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2.5 rounded-[12px] bg-[#18352B] text-[#FBF9F3] font-semibold hover:bg-[#285443] dark:bg-[#D3AA58] dark:text-[#18221E] transition-colors disabled:opacity-50 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MessagesRoute() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-secondary)]">
          <Loader2 className="w-6 h-6 animate-spin text-[#B58A3A]" />
        </div>
      }
    >
      <MessagesContent />
    </React.Suspense>
  );
}
