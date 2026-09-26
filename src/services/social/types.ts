export type FriendshipStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "blocked"
  | "none";

export type OnlinePresenceState =
  | "online"
  | "playing"
  | "away"
  | "offline";

export interface Friend {
  _id: string;
  username: string;
  avatar?: string;
  rating: number;
  online: boolean;
  inGame?: boolean;
  currentGameId?: string;
  roomId?: string;
  opponentName?: string;
  presence: OnlinePresenceState;
  lastSeen?: string | Date;
}

export interface FriendRequestItem {
  id: string;
  user: {
    _id: string;
    username: string;
    rating: number;
    avatar?: string;
  };
  createdAt: string;
}

export interface GameInvitationPayload {
  invitationId: string;
  sender: {
    id: string;
    username: string;
    rating: number;
    avatar?: string;
  };
  timeControl: {
    initialTime: number; // in milliseconds
    increment: number;   // in seconds
  };
  colorPreference: "random" | "white" | "black";
  expiresAt: string | Date;
}

export interface DirectMessageItem {
  _id: string;
  senderId: string;
  recipientId: string;
  message: string;
  read: boolean;
  readAt?: string | Date;
  createdAt: string;
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

export interface ConversationItem {
  partnerId: string;
  partner: {
    _id: string;
    username: string;
    avatar?: string;
    rating: number;
    online: boolean;
  };
  lastMessage: {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
    read: boolean;
  };
  unreadCount: number;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type:
    | "friend_request"
    | "friend_accepted"
    | "game_invite"
    | "game_finished"
    | "draw_offer"
    | "rematch"
    | "spectator"
    | "challenge"
    | "room_invite"
    | "follow"
    | "tournament"
    | "friend_online"
    | "message"
    | "system";
  title?: string;
  message?: string;
  actorId?: string;
  actorUsername?: string;
  gameId?: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface ProfileData {
  _id: string;
  username: string;
  avatar?: string;
  online: boolean;
  inGame?: boolean;
  currentGameId?: string;
  roomId?: string;
  opponentName?: string;
  presence: OnlinePresenceState;
  isFriend?: boolean;
  isPrivate?: boolean;
  message?: string;
  rating: number;
  ratings?: {
    bullet: number;
    blitz: number;
    rapid: number;
    classical: number;
  };
  ratingChangeThisMonth?: string;
  ratingHistory?: { month: string; rating: number }[];
  stats?: {
    games: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
  };
  recentGames?: {
    gameId: string;
    roomId?: string;
    opponent: {
      username: string;
      rating: number;
    };
    playerColor: "white" | "black";
    result: "win" | "loss" | "draw";
    movesCount: number;
    timeControl: string;
    date: string;
  }[];
}
