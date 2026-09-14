import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface IMessage extends Document {
  roomId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
}

const messageSchema =
  new Schema<IMessage>(
    {
      roomId: {
        type: String,
        required: true,
        index: true,
      },

      userId: {
        type: String,
        required: true,
        index: true,
      },

      username: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false,
      },
    },
  );

messageSchema.index({
  roomId: 1,
  createdAt: -1,
});

export const Message =
  mongoose.models.Message ||
  model<IMessage>(
    "Message",
    messageSchema,
  );
