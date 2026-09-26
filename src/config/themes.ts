export type ChessTheme = {
  id: string;
  name: string;
  description: string;
  board: {
    light: string;
    dark: string;
    coordinates: string;
  };
  pieces: string;
  ui: {
    accent: string;
    background: string;
    surface: string;
  };
  access?: "free";
};

export const chessThemes: ChessTheme[] = [
  {
    id: "warm-ivory",
    name: "Warm Ivory & Forest",
    description: "Flagship editorial aesthetic with soft cream squares and deep forest green",
    board: {
      light: "#F0E6D2",
      dark: "#7A9A60",
      coordinates: "default",
    },
    pieces: "classic",
    ui: {
      accent: "#B88A32",
      background: "#F7F4EC",
      surface: "#FAF8F2",
    },
    access: "free",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Warm traditional wooden palette with refined contrast",
    board: {
      light: "#f0d9b5",
      dark: "#b58863",
      coordinates: "default",
    },
    pieces: "classic",
    ui: {
      accent: "#B58A3A",
      background: "#13201B",
      surface: "#1B2A24",
    },
    access: "free",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep charcoal tones with cool graphite squares",
    board: {
      light: "#c8ccd2",
      dark: "#4a5058",
      coordinates: "minimal",
    },
    pieces: "modern",
    ui: {
      accent: "#D3AA58",
      background: "#13201B",
      surface: "#1B2A24",
    },
    access: "free",
  },
  {
    id: "emerald",
    name: "Tournament Emerald",
    description: "Championship tournament green with soft ivory squares",
    board: {
      light: "#eeeed2",
      dark: "#769656",
      coordinates: "default",
    },
    pieces: "tournament",
    ui: {
      accent: "#27815D",
      background: "#13201B",
      surface: "#1B2A24",
    },
    access: "free",
  },
  {
    id: "ivory",
    name: "Ivory Walnut",
    description: "Editorial walnut wood with warm cream highlights",
    board: {
      light: "#eaddca",
      dark: "#7a5c43",
      coordinates: "minimal",
    },
    pieces: "staunton",
    ui: {
      accent: "#B58A3A",
      background: "#13201B",
      surface: "#1B2A24",
    },
    access: "free",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Stealth matte graphite with high-contrast sharp accents",
    board: {
      light: "#71717a",
      dark: "#27272a",
      coordinates: "minimal",
    },
    pieces: "minimal",
    ui: {
      accent: "#D3AA58",
      background: "#13201B",
      surface: "#1B2A24",
    },
    access: "free",
  },
  {
    id: "royal",
    name: "Royal Navy",
    description: "Regal midnight navy paired with burnished gold trim",
    board: {
      light: "#e2d6b5",
      dark: "#203a5e",
      coordinates: "default",
    },
    pieces: "neo",
    ui: {
      accent: "#D3AA58",
      background: "#13201B",
      surface: "#1B2A24",
    },
    access: "free",
  },
];
