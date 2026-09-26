export type BoardTheme = {
  id: string;
  name: string;
  light: string;
  dark: string;
  accent?: string;
  access?: "free";
};

export const boardThemes: BoardTheme[] = [
  {
    id: "classic",
    name: "Classic Wood",
    light: "#f0d9b5",
    dark: "#b58863",
    accent: "#d4a72c",
    access: "free",
  },
  {
    id: "tournament",
    name: "Tournament Green",
    light: "#eeeed2",
    dark: "#769656",
    accent: "#22c55e",
    access: "free",
  },
  {
    id: "midnight",
    name: "Midnight Graphite",
    light: "#c8ccd2",
    dark: "#4a5058",
    accent: "#8da2ff",
    access: "free",
  },
  {
    id: "slate",
    name: "Cool Slate",
    light: "#e0e4e8",
    dark: "#606d7d",
    accent: "#60a5fa",
    access: "free",
  },
  {
    id: "marble",
    name: "Carpathian Marble",
    light: "#f5f5f5",
    dark: "#8f9298",
    accent: "#9ca3af",
    access: "free",
  },
  {
    id: "wood",
    name: "Burled Walnut",
    light: "#e2c9a9",
    dark: "#8c532e",
    accent: "#d7b875",
    access: "free",
  },
  {
    id: "obsidian",
    name: "Obsidian Onyx",
    light: "#52525b",
    dark: "#18181b",
    accent: "#a1a1aa",
    access: "free",
  },
  {
    id: "royal",
    name: "Royal Navy & Gold",
    light: "#e6dcba",
    dark: "#1e3a5f",
    accent: "#d7b875",
    access: "free",
  },
];
