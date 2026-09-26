import mongoose, {
  Schema,
  model,
  type Document,
} from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  rating: number;
  ratings?: {
    bullet: number;
    blitz: number;
    rapid: number;
    classical: number;
  };
  puzzleRating?: number;
  progression?: {
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: Date;
  };
  achievements?: {
    achievementId: string;
    unlockedAt: Date;
  }[];
  preferences?: {
    theme: string;
    boardTheme: string;
    pieceSet: string;
    soundEnabled: boolean;
    animationsEnabled: boolean;
    coordinates: boolean;
  };
  privacy?: {
    profileVisibility: "everyone" | "friends" | "nobody";
    gameHistoryVisibility: "everyone" | "friends" | "nobody";
    onlineStatus: "everyone" | "friends" | "nobody";
    allowGameInvitations: "everyone" | "friends" | "nobody";
    allowFriendRequests: "everyone" | "nobody";
  };
  mutedUserIds?: mongoose.Types.ObjectId[];
  blockedUserIds?: mongoose.Types.ObjectId[];
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: "user" | "moderator" | "admin";
  accountStatus: "ACTIVE" | "SUSPENDED" | "BANNED";
  suspendedUntil?: Date;
  suspensionReason?: string;
  banReason?: string;
  deletedAt?: Date;
  adminPermissions?: string[];
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  isRestricted: boolean;
  restrictionReason?: string;
  ratingHistory: {
    rating: number;
    change: number;
    gameId?: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
    },

    rating: {
      type: Number,
      default: 1200,
    },

    puzzleRating: {
      type: Number,
      default: 1200,
    },

    ratings: {
      bullet: { type: Number, default: 1200 },
      blitz: { type: Number, default: 1200 },
      rapid: { type: Number, default: 1200 },
      classical: { type: Number, default: 1200 },
    },

    progression: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      currentStreak: { type: Number, default: 1 },
      longestStreak: { type: Number, default: 1 },
      lastActiveDate: { type: Date, default: Date.now },
    },

    achievements: [
      {
        achievementId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],

    preferences: {
      theme: { type: String, default: "classic" },
      boardTheme: { type: String, default: "classic" },
      pieceSet: { type: String, default: "classic" },
      soundEnabled: { type: Boolean, default: true },
      animationsEnabled: { type: Boolean, default: true },
      coordinates: { type: Boolean, default: true },
    },

    privacy: {
      profileVisibility: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone",
      },
      gameHistoryVisibility: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone",
      },
      onlineStatus: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone",
      },
      allowGameInvitations: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone",
      },
      allowFriendRequests: {
        type: String,
        enum: ["everyone", "nobody"],
        default: "everyone",
      },
    },

    mutedUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    blockedUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    emailVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    verificationTokenExpires: {
      type: Date,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },

    accountStatus: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BANNED"],
      default: "ACTIVE",
      index: true,
    },

    suspendedUntil: {
      type: Date,
    },

    suspensionReason: {
      type: String,
    },

    banReason: {
      type: String,
    },

    deletedAt: {
      type: Date,
      index: true,
    },

    adminPermissions: [
      {
        type: String,
      },
    ],

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
    },

    isRestricted: {
      type: Boolean,
      default: false,
    },

    restrictionReason: {
      type: String,
    },

    ratingHistory: [
      {
        rating: Number,
        change: Number,
        gameId: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.index({ rating: -1 });
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ createdAt: -1 });

export const User =
  mongoose.models.User ||
  model<IUser>("User", userSchema);
