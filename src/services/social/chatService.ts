import { apiFetch } from "@/lib/api";
import { socket } from "@/lib/socket";
import type { ConversationItem, DirectMessageItem } from "./types";

export const chatService = {
  async fetchConversations(): Promise<ConversationItem[]> {
    try {
      const res = await apiFetch("/api/messages/conversations");
      if (!res.ok) return [];
      const data = await res.json();
      return data.success && Array.isArray(data.conversations) ? data.conversations : [];
    } catch {
      return [];
    }
  },

  async fetchMessages(
    otherUserId: string,
    before?: string,
    limit: number = 30,
  ): Promise<{ messages: DirectMessageItem[]; hasMore: boolean }> {
    try {
      let url = `/api/messages/${otherUserId}?limit=${limit}`;
      if (before) url += `&before=${encodeURIComponent(before)}`;
      const res = await apiFetch(url);
      if (!res.ok) return { messages: [], hasMore: false };
      const data = await res.json();
      return {
        messages: Array.isArray(data.messages) ? data.messages : [],
        hasMore: !!data.hasMore,
      };
    } catch {
      return { messages: [], hasMore: false };
    }
  },

  async sendMessage(otherUserId: string, message: string): Promise<{ success: boolean; message?: DirectMessageItem; error?: string }> {
    try {
      const res = await apiFetch(`/api/messages/${otherUserId}`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || "Failed to send message" };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: "Network error sending message" };
    }
  },

  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return { success: !!data.success };
    } catch {
      return { success: false };
    }
  },

  async markConversationRead(otherUserId: string): Promise<void> {
    try {
      await apiFetch(`/api/messages/${otherUserId}/read`, {
        method: "PATCH",
      });
    } catch {}
  },

  sendTypingIndicator(recipientId: string, isTyping: boolean): void {
    if (socket && socket.connected) {
      socket.emit("social:typing", { recipientId, isTyping });
    }
  },

  subscribeToMessages(callback: (msg: DirectMessageItem) => void): () => void {
    const handleMsg = (msg: any) => {
      if (msg) callback(msg);
    };
    if (socket) {
      socket.on("social:message", handleMsg);
    }
    return () => {
      if (socket) {
        socket.off("social:message", handleMsg);
      }
    };
  },

  subscribeToTyping(callback: (data: { senderId: string; isTyping: boolean }) => void): () => void {
    const handleTyping = (data: any) => {
      if (data) callback(data);
    };
    if (socket) {
      socket.on("social:typing", handleTyping);
    }
    return () => {
      if (socket) {
        socket.off("social:typing", handleTyping);
      }
    };
  },
};
