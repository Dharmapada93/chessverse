import { apiFetch } from "@/lib/api";
import type { Friend, FriendRequestItem, ProfileData } from "./types";

export const socialService = {
  async fetchFriends(): Promise<Friend[]> {
    try {
      const res = await apiFetch("/api/friends");
      if (!res.ok) return [];
      const data = await res.json();
      return data.success && Array.isArray(data.friends) ? data.friends : [];
    } catch {
      return [];
    }
  },

  async fetchFriendRequests(): Promise<{
    incoming: FriendRequestItem[];
    outgoing: FriendRequestItem[];
  }> {
    try {
      const res = await apiFetch("/api/friends/requests");
      if (!res.ok) return { incoming: [], outgoing: [] };
      const data = await res.json();
      return {
        incoming: Array.isArray(data.incoming) ? data.incoming : [],
        outgoing: Array.isArray(data.outgoing) ? data.outgoing : [],
      };
    } catch {
      return { incoming: [], outgoing: [] };
    }
  },

  async searchPlayers(query: string): Promise<any[]> {
    const q = query.trim();
    if (!q) return [];
    try {
      const res = await apiFetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.success && Array.isArray(data.users) ? data.users : [];
    } catch {
      return [];
    }
  },

  async sendFriendRequest(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiFetch("/api/friends/request", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || (res.ok ? "Friend request sent" : "Failed to send request"),
      };
    } catch {
      return { success: false, message: "Network error sending friend request" };
    }
  },

  async acceptFriendRequest(friendshipId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiFetch(`/api/friends/${friendshipId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "Friend request accepted",
      };
    } catch {
      return { success: false, message: "Failed to accept friend request" };
    }
  },

  async declineFriendRequest(friendshipId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiFetch(`/api/friends/${friendshipId}/decline`, {
        method: "POST",
      });
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "Friend request declined",
      };
    } catch {
      return { success: false, message: "Failed to decline friend request" };
    }
  },

  async cancelFriendRequest(friendshipId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiFetch(`/api/friends/${friendshipId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "Friend request cancelled",
      };
    } catch {
      return { success: false, message: "Failed to cancel friend request" };
    }
  },

  async removeFriend(friendId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiFetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "Friend removed",
      };
    } catch {
      return { success: false, message: "Failed to remove friend" };
    }
  },

  async blockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiFetch(`/api/users/${userId}/block`, {
        method: "POST",
      });
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "User blocked",
      };
    } catch {
      return { success: false, message: "Failed to block user" };
    }
  },

  async unblockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiFetch(`/api/users/${userId}/block`, {
        method: "DELETE",
      });
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "User unblocked",
      };
    } catch {
      return { success: false, message: "Failed to unblock user" };
    }
  },

  async fetchPlayerProfile(username: string): Promise<ProfileData | null> {
    try {
      const res = await apiFetch(`/api/users/${encodeURIComponent(username)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.success && data.user ? data.user : null;
    } catch {
      return null;
    }
  },

  async updatePrivacySettings(settings: {
    profileVisibility?: string;
    gameHistoryVisibility?: string;
    onlineStatus?: string;
    allowGameInvitations?: string;
    allowFriendRequests?: string;
  }): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch("/api/users/privacy", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      return { success: !!data.success };
    } catch {
      return { success: false };
    }
  },

  async reportUser(payload: {
    reportedUserId: string;
    category: string;
    description?: string;
    gameId?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiFetch("/api/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return {
        success: !!data.success,
        message: data.message || "Report submitted successfully.",
      };
    } catch {
      return { success: false, message: "Failed to submit report" };
    }
  },
};
