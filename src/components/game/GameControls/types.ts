export interface GameControlsProps {
  onOfferDraw: () => void;
  onResign: () => void;
  onFlipBoard?: () => void;
  onToggleSound?: () => void;
  onOpenSettings?: () => void;
  soundEnabled?: boolean;
  isGameOver?: boolean;
  isSpectator?: boolean;
  drawOffered?: boolean;
  className?: string;
}
