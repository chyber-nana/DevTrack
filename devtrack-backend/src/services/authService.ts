import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db.js";

export async function registerUser(
  email: string,
  username: string,
  name: string,
  password: string
) {
  const existingUser = await db.orm.public.User
    .where({ email })
    .first();

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.orm.public.User.create({
    email,
    username,
    name,
    passwordHash,
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
  };
}

export async function loginUser(
  email: string,
  password: string
) {
  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  };
}