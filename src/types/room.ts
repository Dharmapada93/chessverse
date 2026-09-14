export type TimeControl = {
  minutes: number;
  increment: number;
  label: string;
};

export type RoomSettings = {
  name: string;
  visibility: "private" | "public";
  rated: boolean;
  spectators: boolean;
  timeControl: TimeControl;
};

export type Room = {
  id: string;
  code: string;
  settings: RoomSettings;
  host: {
    name: string;
    rating: number;
  };
  status: "waiting" | "playing" | "finished";
};
