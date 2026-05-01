import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"
import { userSelect } from "../dto/user.dto"

export async function addHistoric(userId: number, eventId: number, opType: string) {
  return prisma.historic.create({
    data: { userId, eventId, opType }
  })
}

export async function getMyHistoric(userId: number) {
  return prisma.historic.findMany({
    where: { userId },
    include: {
      event: { include: { category: true } }
    },
    orderBy: { opAt: "desc" }
  })
}

export async function getAllHistorics() {
  return prisma.historic.findMany({
    include: {
      user: { select: userSelect },
      event: { include: { category: true } }
    },
    orderBy: { opAt: "desc" }
  })
}

export async function deleteHistoric(id: number) {
  const historic = await prisma.historic.findUnique({ where: { id } })
  if (!historic) throw new AppError("Historique non trouvé", 404)
  return prisma.historic.delete({ where: { id } })
}