import type { Room } from "@/types/room";

const STORAGE_KEY = "chessverse-room";

export function createRoom(
  settings: Room["settings"],
): Room {
  const room: Room = {
    id: crypto.randomUUID(),
    code: generateRoomCode(),
    settings,
    host: {
      name: "You",
      rating: 1428,
    },
    status: "waiting",
  };

  saveRoom(room);

  return room;
}

export function saveRoom(room: Room) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(room),
  );
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

function generateRoomCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "CV-";

  for (let i = 0; i < 4; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return code;
}
