import { prisma } from "../prisma"
 
export async function getUsers() {
  return prisma.user.findMany()
}