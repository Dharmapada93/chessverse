import { Room } from "../models/Room.js";

function generateRoomCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "CV-";

  for (let i = 0; i < 4; i++) {
    code +=
      characters.charAt(
        Math.floor(
          Math.random() *
            characters.length,
        ),
      );
  }

  return code;
}

export async function createPrivateRoom(
  name: string,
  minutes: number,
  increment: number,
  hostId: string,
) {
  let code =
    generateRoomCode();

  while (
    await Room.exists({ code })
  ) {
    code =
      generateRoomCode();
  }

  return Room.create({
    code,

    name,

    visibility: "private",

    rated: true,

    spectators: true,

    timeControl: {
      minutes,

      increment,

      label:
        `${minutes}+${increment}`,
    },

    hostId,

    status: "waiting",
  });
}
