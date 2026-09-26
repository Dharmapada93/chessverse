export type AdminRole = "user" | "moderator" | "admin";

export type UserAccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  rating: number;
  role: AdminRole;
  accountStatus: UserAccountStatus;
  suspendedUntil?: string;
  suspensionReason?: string;
  banReason?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGamePlayer {
  userId?: string;
  username: string;
  rating?: number;
}

export interface AdminGame {
  _id: string;
  white: AdminGamePlayer;
  black: AdminGamePlayer;
  timeControl: {
    initial: number;
    increment: number;
  };
  status: "waiting" | "playing" | "finished" | "aborted";
  result?: "white" | "black" | "draw" | "aborted";
  pgn?: string;
  fen?: string;
  moves?: Array<{
    moveNumber: number;
    san: string;
    fen: string;
    timestamp: number;
  }>;
  isAiGame?: boolean;
  aiDifficulty?: string;
  createdAt: string;
  endedAt?: string;
}

export interface AdminReportNote {
  note: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface AdminReport {
  _id: string;
  reporterId: {
    _id: string;
    username: string;
    email: string;
    rating?: number;
  };
  reportedUserId: {
    _id: string;
    username: string;
    email: string;
    rating?: number;
    accountStatus?: UserAccountStatus;
  };
  category: "Cheating" | "Harassment" | "Spam" | "Inappropriate content" | "Abusive behavior" | "Other";
  description?: string;
  gameId?: {
    _id: string;
    white: AdminGamePlayer;
    black: AdminGamePlayer;
    status: string;
    result?: string;
  };
  status: "pending" | "open" | "investigating" | "reviewed" | "resolved" | "dismissed";
  assignedTo?: string;
  assignedToName?: string;
  notes: AdminReportNote[];
  actionTaken?: "warn" | "suspend" | "ban" | "dismiss" | "none";
  resolutionNotes?: string;
  evidence?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  _id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  targetType: "user" | "game" | "report" | "announcement" | "system" | "auth";
  targetId?: string;
  targetName?: string;
  reason?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminAnnouncement {
  _id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "success" | "critical";
  startTime: string;
  endTime?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceHealthItem {
  status: "healthy" | "degraded" | "critical" | "warning";
  latencyMs?: number;
  [key: string]: any;
}

export interface AdminSystemHealth {
  timestamp: string;
  services: {
    api: ServiceHealthItem;
    database: ServiceHealthItem;
    realtime: ServiceHealthItem;
    chessEngine: ServiceHealthItem;
    aiService: ServiceHealthItem;
    queue: ServiceHealthItem;
  };
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  gamesToday: number;
  gamesThisWeek: number;
  gamesThisMonth: number;
  openReports: number;
  activeGames: number;
  onlineUsers: number;
}

export interface AdminAnalyticsAggregates {
  totalGames: number;
  newUsers: number;
  aiGames: number;
  humanGames: number;
  completionRatePct: number;
  avgGameDurationMin: number;
}

export interface AdminAnalytics {
  range: "24h" | "7d" | "30d" | "90d" | "custom";
  aggregates: AdminAnalyticsAggregates;
  timeControlBreakdown: {
    bullet: number;
    blitz: number;
    rapid: number;
    classical: number;
  };
}
