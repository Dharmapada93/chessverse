import { Notification } from "../models/Notification.js";

type CreateNotificationInput = {
  userId: string;

  type:
    | "friend_request"
    | "friend_accepted"
    | "challenge"
    | "room_invite"
    | "follow"
    | "tournament";

  title: string;
  message: string;

  actorId?: string;
  actorUsername?: string;

  referenceId?: string;
};

export async function createNotification(
  input: CreateNotificationInput,
) {
  return Notification.create(input);
}
