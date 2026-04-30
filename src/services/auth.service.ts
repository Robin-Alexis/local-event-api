import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existing) throw new AppError("L'email existe déjà", 409);

  const hashed = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: { ...data, password: hashed }
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) throw new AppError("Invalid credentials", 401);

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new AppError("Invalid credentials", 401);

  return user;
}

export async function generateRefreshToken(userId: number) {
  const token = crypto.randomBytes(64).toString("hex");
  const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expireAt
    }
  });
  return token;
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!stored) throw new AppError("Invalid refresh token", 401);
  if (stored.expireAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new AppError("Refresh token expired", 401);
  }

  return stored.user;
}

export async function logout(userId: number) {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  });
}