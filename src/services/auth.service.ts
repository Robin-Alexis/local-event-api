import bcrypt from "bcrypt";
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

  if (existing) throw new AppError("Email already used", 409);

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