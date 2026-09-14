import type { Room } from "@/types/room";

const STORAGE_KEY = "chessverse-room";

export function saveRoom(room: Room) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(room));
}

export function getRoom(): Room | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(STORAGE_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored) as Room;
  } catch {
    return null;
  }
}

export function clearRoom() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(STORAGE_KEY);
}
