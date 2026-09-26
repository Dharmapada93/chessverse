export type MoveEntry = {
  number: number;
  white?: string;
  black?: string;
  whiteMoveIndex?: number;
  blackMoveIndex?: number;
};

export interface MoveListProps {
  moves: MoveEntry[];
  currentMoveIndex?: number;
  onSelectMove?: (moveIndex: number) => void;
  onFirst?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  canNavigate?: boolean;
  className?: string;
}
