import type { GameInvitationPayload } from "@/services/social/types";

export interface GameInviteProps {
  invitation: GameInvitationPayload;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
}
