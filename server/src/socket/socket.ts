import type { Server } from "socket.io";

type RoomPlayer = {
  socketId: string;
  name: string;
  role: "player" | "spectator";
};

const roomPlayers = new Map<string, RoomPlayer[]>();

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(
      "room:join",
      ({
        roomId,
        name,
        role,
      }: {
        roomId: string;
        name: string;
        role: "player" | "spectator";
      }) => {
        socket.join(roomId);

        const players =
          roomPlayers.get(roomId) ?? [];

        players.push({
          socketId: socket.id,
          name,
          role,
        });

        roomPlayers.set(roomId, players);

        io.to(roomId).emit("room:members", {
          members: players,
        });

        socket.emit("room:joined", {
          roomId,
          role,
        });

        console.log(
          `${name} joined ${roomId} as ${role}`,
        );
      },
    );

    socket.on(
      "room:leave",
      ({ roomId }: { roomId: string }) => {
        socket.leave(roomId);

        removePlayer(socket.id, roomId);

        io.to(roomId).emit("room:members", {
          members: roomPlayers.get(roomId) ?? [],
        });
      },
    );

    socket.on(
      "chat:send",
      ({
        roomId,
        name,
        message,
      }: {
        roomId: string;
        name: string;
        message: string;
      }) => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
          return;
        }

        io.to(roomId).emit("chat:message", {
          id: crypto.randomUUID(),
          name,
          message: trimmedMessage,
          createdAt: new Date().toISOString(),
        });
      },
    );

    socket.on("disconnect", () => {
      for (const roomId of roomPlayers.keys()) {
        const removed = removePlayer(
          socket.id,
          roomId,
        );

        if (removed) {
          io.to(roomId).emit("room:members", {
            members: roomPlayers.get(roomId) ?? [],
          });
        }
      }

      console.log(
        `Socket disconnected: ${socket.id}`,
      );
    });
  });
}

function removePlayer(
  socketId: string,
  roomId: string,
) {
  const players = roomPlayers.get(roomId);

  if (!players) {
    return false;
  }

  const filtered = players.filter(
    (player) => player.socketId !== socketId,
  );

  if (filtered.length === 0) {
    roomPlayers.delete(roomId);
  } else {
    roomPlayers.set(roomId, filtered);
  }

  return filtered.length !== players.length;
}
