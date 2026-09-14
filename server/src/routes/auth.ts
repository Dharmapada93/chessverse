import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    if (
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Username, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters",
      });
    }

    const existingUser =
      await User.findOne({
        $or: [
          { email },
          { username },
        ],
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Username or email already exists",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET is not configured",
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      secret,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

router.get(
  "/me",
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const user =
      await User.findById(
        req.userId,
      ).select(
        "-passwordHash",
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  },
);

export default router;
