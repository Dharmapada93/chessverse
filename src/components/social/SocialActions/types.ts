export type SocialActionModalType = "block" | "remove" | "report" | null;

export interface SocialActionsProps {
  modalType: SocialActionModalType;
  targetUsername: string;
  targetUserId: string;
  gameId?: string;
  onClose: () => void;
  onConfirmBlock?: (userId: string) => Promise<void>;
  onConfirmRemove?: (userId: string) => Promise<void>;
  onConfirmReport?: (payload: {
    reportedUserId: string;
    category: string;
    description?: string;
    gameId?: string;
  }) => Promise<void>;
}
