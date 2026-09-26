export type PieceSet = {
  id: string;
  name: string;
  description: string;
  samplePiece: string; // unicode symbol for preview
  fontClass?: string;
  access?: "free";
};

export const pieceSets: PieceSet[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Standard balanced tournament iconography",
    samplePiece: "♞",
    access: "free",
  },
  {
    id: "staunton",
    name: "Staunton",
    description: "Timeless handcrafted nineteenth-century heritage",
    samplePiece: "♚",
    access: "free",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Crisp vector geometry with high-contrast bevels",
    samplePiece: "♛",
    access: "free",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Nordic streamlined silhouette for rapid calculation",
    samplePiece: "♝",
    access: "free",
  },
  {
    id: "tournament",
    name: "Tournament",
    description: "Official FIDE championship visual clarity",
    samplePiece: "♜",
    access: "free",
  },
  {
    id: "neo",
    name: "Neo",
    description: "Contemporary dynamic curves with burnished depth",
    samplePiece: "♟",
    access: "free",
  },
];
