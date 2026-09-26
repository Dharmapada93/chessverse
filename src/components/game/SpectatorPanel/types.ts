export interface SpectatorInfo {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
}

export interface SpectatorPanelProps {
  count: number;
  spectators?: SpectatorInfo[];
  isSpectator?: boolean;
  className?: string;
}
