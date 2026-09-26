"use client";

import React from "react";

export type PieceSetStyle = "classic" | "modern" | "minimal";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type PieceColor = "w" | "b";

interface PieceIconProps {
  color: PieceColor;
  type: PieceType;
  style?: PieceSetStyle;
  className?: string;
}

// -------------------------------------------------------------
// CLASSIC PIECE SET (Staunton-inspired refined vector design)
// -------------------------------------------------------------
function ClassicPiece({ color, type, className }: { color: PieceColor; type: PieceType; className?: string }) {
  const isWhite = color === "w";
  const fill = isWhite ? "#f8f5ee" : "#1f1d1a";
  const stroke = isWhite ? "#4a453e" : "#0d0c0b";
  const highlight = isWhite ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.15)";
  const innerStroke = isWhite ? "#8c8273" : "#38342e";

  switch (type) {
    case "p": // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.5 9a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M22.5 10a3 3 0 0 1 2.8 2" stroke={highlight} strokeWidth="1" strokeLinecap="round" />
          <path d="M16 32c1-6 3.5-11 6.5-13 3 2 5.5 7 6.5 13H16z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M12 37c0-2 3-3 10.5-3s10.5 1 10.5 3-2 3-10.5 3S12 39 12 37z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M14 36c3-1 6-1.5 8.5-1.5s5.5.5 8.5 1.5" stroke={innerStroke} strokeWidth="1" />
        </svg>
      );

    case "n": // Knight
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 10c-3 0-6.5 1.5-8 5.5 2 0 4-1 6 0-3 2-5 5.5-5 9 0 4 3 6.5 3 6.5s-2 2-3 4c3 0 6.5-.5 8.5-2.5 0 0 2 3 5 3 4 0 7-3 8-9 1-6-2.5-12-6.5-15-2.5-1-5-2-8-2z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="17.5" cy="18.5" r="1.5" fill={stroke} />
          <path d="M13 24.5c2 1 4.5.5 6-.5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M11 37c0-2 3-3 11.5-3s11.5 1 11.5 3-2.5 3-11.5 3S11 39 11 37z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case "b": // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22.5" cy="8" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path
            d="M17.5 16c-3 3-3.5 8.5-1.5 13 2 1.5 4.5 2 6.5 2s4.5-.5 6.5-2c2-4.5 1.5-10-1.5-13-2-2-8-2-10 0z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path d="M21 16l4 5m-5 0l5 5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M15 32c1 0 3-1 7.5-1s6.5 1 7.5 1" stroke={innerStroke} strokeWidth="1.5" />
          <path d="M12 37c0-2 3-3 10.5-3s10.5 1 10.5 3-2 3-10.5 3S12 39 12 37z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case "r": // Rook
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 13h4v4h4v-4h5v4h4v-4h4v7h-21v-7z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M14 20l2 12h13l2-12H14z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M13 32h19v3H13v-3z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M11 38c0-1.5 2.5-2.5 11.5-2.5s11.5 1 11.5 2.5-2.5 2.5-11.5 2.5S11 39.5 11 38z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case "q": // Queen
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="14" r="1.5" fill={fill} stroke={stroke} strokeWidth="1" />
          <circle cx="15.5" cy="11.5" r="1.5" fill={fill} stroke={stroke} strokeWidth="1" />
          <circle cx="22.5" cy="10" r="1.5" fill={fill} stroke={stroke} strokeWidth="1" />
          <circle cx="29.5" cy="11.5" r="1.5" fill={fill} stroke={stroke} strokeWidth="1" />
          <circle cx="36" cy="14" r="1.5" fill={fill} stroke={stroke} strokeWidth="1" />
          <path
            d="M9 16l3.5 13.5h20L36 16l-5.5 7.5L22.5 12l-8 11.5L9 16z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M13 32h19c.5 1.5 0 3-1.5 3h-16c-1.5 0-2-1.5-1.5-3z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M11 38c0-1.5 2.5-2.5 11.5-2.5s11.5 1 11.5 2.5-2.5 2.5-11.5 2.5S11 39.5 11 38z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case "k": // King
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cross */}
          <path d="M22.5 6v6m-3-3h6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M14 16c2-3 5-4 8.5-4s6.5 1 8.5 4c2.5 4 1.5 11-1.5 13.5h-14C12.5 27 11.5 20 14 16z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <circle cx="22.5" cy="20" r="3.5" stroke={innerStroke} strokeWidth="1.2" />
          <path d="M13 32h19v3H13v-3z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M11 38c0-1.5 2.5-2.5 11.5-2.5s11.5 1 11.5 2.5-2.5 2.5-11.5 2.5S11 39.5 11 38z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
  }
}

// -------------------------------------------------------------
// MODERN PIECE SET (Contemporary geometric clean silhouette)
// -------------------------------------------------------------
function ModernPiece({ color, type, className }: { color: PieceColor; type: PieceType; className?: string }) {
  const isWhite = color === "w";
  const fill = isWhite ? "#ede8db" : "#24211d";
  const stroke = isWhite ? "#5c564c" : "#141312";
  const accent = isWhite ? "#d7b875" : "#a88d4c";

  switch (type) {
    case "p":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22.5" cy="13" r="5" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M18 20l-3 14h15l-3-14h-9z" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="13" y="34" width="19" height="3.5" rx="1.5" fill={accent} stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case "n":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17 11h8l4 6-2 5 4 4v8H14v-6l4-5-3-5 2-7z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="18" r="1.5" fill={accent} />
          <rect x="12" y="34" width="21" height="3.5" rx="1.5" fill={accent} stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case "b":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="22.5,7 28,18 25,34 20,34 17,18" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="22.5" cy="14" r="2" fill={accent} />
          <line x1="20" y1="21" x2="25" y2="21" stroke={accent} strokeWidth="1.5" />
          <rect x="13" y="34" width="19" height="3.5" rx="1.5" fill={accent} stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case "r":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 11h4v4h3v-4h4v4h3v-4h4v8H14v-8z" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="16" y="19" width="13" height="15" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <rect x="12" y="34" width="21" height="3.5" rx="1.5" fill={accent} stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case "q":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,14 17,20 22.5,12 28,20 33,14 30,34 15,34" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="22.5" cy="24" r="2.5" fill={accent} />
          <rect x="12" y="34" width="21" height="3.5" rx="1.5" fill={accent} stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
    case "k":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.5 6v5m-2.5-2.5h5" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <polygon points="14,14 22.5,11 31,14 28,34 17,34" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <line x1="18" y1="23" x2="27" y2="23" stroke={accent} strokeWidth="1.5" />
          <rect x="12" y="34" width="21" height="3.5" rx="1.5" fill={accent} stroke={stroke} strokeWidth="1.4" />
        </svg>
      );
  }
}

// -------------------------------------------------------------
// MINIMAL PIECE SET (Scandinavian / Bauhaus refined line glyphs)
// -------------------------------------------------------------
function MinimalPiece({ color, type, className }: { color: PieceColor; type: PieceType; className?: string }) {
  const isWhite = color === "w";
  const stroke = isWhite ? "#f3efe5" : "#2b2824";
  const fill = isWhite ? "rgba(243, 239, 229, 0.25)" : "rgba(43, 40, 36, 0.4)";

  switch (type) {
    case "p":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22.5" cy="16" r="4.5" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="16" y1="34" x2="29" y2="34" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M19 22l-2 10h11l-2-10" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "n":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17 12h7l4 7-3 5 4 4v6H15v-5l4-5-4-5 2-7z"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line x1="14" y1="34" x2="30" y2="34" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "b":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.5 10c4 6 5.5 12 4 19h-8c-1.5-7 0-13 4-19z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <line x1="16" y1="34" x2="29" y2="34" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="22.5" cy="18" r="1.5" fill={stroke} />
        </svg>
      );
    case "r":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="16" y="14" width="13" height="16" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <line x1="14" y1="14" x2="31" y2="14" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="34" x2="31" y2="34" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "q":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 16l4 5 4.5-8 4.5 8 4-5-2 14h-13l-2-14z"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line x1="14" y1="34" x2="31" y2="34" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "k":
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="22.5" y1="8" x2="22.5" y2="13" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="10.5" x2="25" y2="10.5" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M15 17c3-3 6-4 7.5-4s4.5 1 7.5 4l-2 13h-11l-2-13z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <line x1="14" y1="34" x2="31" y2="34" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
}

export function PieceIcon({ color, type, style = "classic", className = "w-full h-full" }: PieceIconProps) {
  if (style === "modern") {
    return <ModernPiece color={color} type={type} className={className} />;
  }
  if (style === "minimal") {
    return <MinimalPiece color={color} type={type} className={className} />;
  }
  return <ClassicPiece color={color} type={type} className={className} />;
}
