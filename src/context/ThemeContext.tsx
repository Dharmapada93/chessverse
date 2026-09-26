"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ColorMode = "dark" | "light";

export interface ThemeContextType {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  boardTheme: string;
  setBoardTheme: (themeId: string) => void;
  pieceSet: string;
  setPieceSet: (setId: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  coordinates: boolean;
  setCoordinates: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>("light");
  const [boardTheme, setBoardThemeState] = useState<string>("tournament");
  const [pieceSet, setPieceSetState] = useState<string>("classic");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [coordinates, setCoordinatesState] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedMode = localStorage.getItem("chessverse-color-mode") as ColorMode;
    const initialMode: ColorMode = savedMode === "dark" || savedMode === "light" ? savedMode : "light";
    setColorModeState(initialMode);
    document.documentElement.setAttribute("data-theme", initialMode);
    document.documentElement.classList.toggle("dark", initialMode === "dark");

    const savedBoard = localStorage.getItem("chessverse-board-theme");
    if (savedBoard) setBoardThemeState(savedBoard);

    const savedPiece = localStorage.getItem("chessverse-piece-set");
    if (savedPiece) setPieceSetState(savedPiece);

    const savedSound = localStorage.getItem("chessverse-sound");
    if (savedSound !== null) setSoundEnabledState(savedSound === "true");

    const savedCoords = localStorage.getItem("chessverse-coordinates");
    if (savedCoords !== null) setCoordinatesState(savedCoords === "true");
  }, []);

  function setColorMode(mode: ColorMode) {
    setColorModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-color-mode", mode);
      document.documentElement.setAttribute("data-theme", mode);
      document.documentElement.classList.toggle("dark", mode === "dark");
    }
  }

  function toggleColorMode() {
    setColorMode(colorMode === "dark" ? "light" : "dark");
  }

  function setBoardTheme(themeId: string) {
    setBoardThemeState(themeId);
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-board-theme", themeId);
    }
  }

  function setPieceSet(setId: string) {
    setPieceSetState(setId);
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-piece-set", setId);
    }
  }

  function setSoundEnabled(enabled: boolean) {
    setSoundEnabledState(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-sound", String(enabled));
    }
  }

  function setCoordinates(enabled: boolean) {
    setCoordinatesState(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-coordinates", String(enabled));
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        colorMode,
        setColorMode,
        toggleColorMode,
        boardTheme,
        setBoardTheme,
        pieceSet,
        setPieceSet,
        soundEnabled,
        setSoundEnabled,
        coordinates,
        setCoordinates,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
