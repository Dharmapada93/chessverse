import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IGameChat
  extends Document {
  gameId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const gameChatSchema =
  new Schema<IGameChat>(
    {
      gameId: {
        type: Schema.Types.ObjectId,
        ref: "Game",
        required: true,
        index: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      message: {
        type: String,
        required: true,
        maxlength: 300,
        trim: true,
      },
    },
    {
      timestamps: true,
    },
  );

export const GameChat =
  mongoose.models.GameChat ||
  mongoose.model<IGameChat>(
    "GameChat",
    gameChatSchema,
  );
