import { AppError } from "../errors/AppError"
import { prisma } from "../prisma"
import { userSelect } from "../dto/user.dto"
 
export async function getUsers() {
  return prisma.user.findMany({ select: userSelect })
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect })
  if (!user) throw new AppError("User not found", 404)
  return user
}

export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: { id }
  })
}