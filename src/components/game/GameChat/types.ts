export interface ChatMessage {
  id: string;
  userId?: string;
  username: string;
  message: string;
  role?: "player" | "spectator" | "admin";
  createdAt?: string | Date;
  reactions?: Record<string, number>;
}

export interface GameChatProps {
  gameId?: string;
  roomId?: string;
  isSpectator?: boolean;
  isMobileDrawer?: boolean;
  onCloseDrawer?: () => void;
  className?: string;
}
