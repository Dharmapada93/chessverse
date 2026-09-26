import type { Friend } from "@/services/social/types";

export interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend?: Friend | null;
  onChallengeSent?: () => void;
}
