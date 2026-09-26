import { apiFetch } from "@/lib/api";

export const invitationService = {
  async sendChallenge(payload: {
    username: string;
    timeControl: {
      initialTime: number; // in milliseconds
      increment: number;   // in seconds
      minutes?: number;
    };
    colorPreference?: "random" | "white" | "black";
    rated?: boolean;
  }): Promise<{ success: boolean; challenge?: any; message?: string }> {
    try {
      const minutes = payload.timeControl.minutes || Math.round(payload.timeControl.initialTime / 60000);
      const res = await apiFetch("/api/challenges", {
        method: "POST",
        body: JSON.stringify({
          username: payload.username,
          timeControl: {
            minutes,
            increment: payload.timeControl.increment,
          },
          colorPreference: payload.colorPreference || "random",
          rated: payload.rated ?? true,
        }),
      });
      const data = await res.json();
      return {
        success: !!data.success,
        challenge: data.challenge,
        message: data.message,
      };
    } catch {
      return { success: false, message: "Network error sending challenge" };
    }
  },

  async acceptChallenge(challengeId: string): Promise<{ success: boolean; gameId?: string; roomId?: string; message?: string }> {
    try {
      const res = await apiFetch(`/api/challenges/${challengeId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      return {
        success: !!data.success,
        gameId: data.game?.id || data.game?._id,
        roomId: data.room?.code,
        message: data.message,
      };
    } catch {
      return { success: false, message: "Network error accepting challenge" };
    }
  },

  async declineChallenge(challengeId: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch(`/api/challenges/${challengeId}/decline`, {
        method: "POST",
      });
      const data = await res.json();
      return { success: !!data.success };
    } catch {
      return { success: false };
    }
  },

  async cancelChallenge(challengeId: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch(`/api/challenges/${challengeId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      return { success: !!data.success };
    } catch {
      return { success: false };
    }
  },

  async createInviteLink(params: {
    timeControl: { initialTime: number; increment: number };
    colorPreference?: "random" | "white" | "black";
    rated?: boolean;
  }): Promise<{ success: boolean; inviteUrl?: string; token?: string; message?: string }> {
    try {
      const res = await apiFetch("/api/challenges/invite", {
        method: "POST",
        body: JSON.stringify(params),
      });
      const data = await res.json();
      return {
        success: !!data.success,
        inviteUrl: data.invite?.inviteUrl,
        token: data.invite?.token,
        message: data.message,
      };
    } catch {
      return { success: false, message: "Failed to generate invite link" };
    }
  },

  async fetchInviteLink(token: string): Promise<{ success: boolean; invite?: any; message?: string }> {
    try {
      const res = await apiFetch(`/api/challenges/invite/${token}`);
      const data = await res.json();
      return {
        success: !!data.success,
        invite: data.invite,
        message: data.message,
      };
    } catch {
      return { success: false, message: "Network error loading invitation" };
    }
  },

  async acceptInviteLink(token: string): Promise<{ success: boolean; gameId?: string; roomId?: string; message?: string }> {
    try {
      const res = await apiFetch(`/api/challenges/invite/${token}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      return {
        success: !!data.success,
        gameId: data.gameId,
        roomId: data.roomId,
        message: data.message,
      };
    } catch {
      return { success: false, message: "Failed to join game from link" };
    }
  },
};
