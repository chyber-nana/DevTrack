import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { db } from "../prisma/db.js";

export async function register(
  req: Request,
  res: Response
) {
  try {
    const { email, username, name, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, username, and password are required",
      });
    }

    const user = await registerUser(
      email,
      username,
      name,
      password
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    console.error("Registration failed:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser(email, password);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.error("Login failed:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const user = await db.orm.public.User
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Failed to fetch current user:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
    });
  }
}