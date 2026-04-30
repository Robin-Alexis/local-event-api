import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"

export async function createEvaluation(userId: number, eventId: number, data: {
    note: number,
    comment?: string
}) {
    const event = await prisma.event.findUnique({ where : { id: eventId}})
    if (!event) throw new AppError("Événement non trouvé", 404)

    const participation = await prisma.participation.findUnique({
        where: { userId_eventId: { userId, eventId }}
    })
    if (!participation) throw new AppError("Vous devez participer à l'évènement pour pouvoir l'évaluer", 403)

    const existing = await prisma.evaluation.findFirst({
        where: {userId, eventId}
    })
    if (existing) throw new AppError("Vous avez déjà évaluer cet évènement", 409)

    return prisma.evaluation.create({
        data: { ...data, userId, eventId}
    })
}

export async function getEventEvaluations(eventId: number) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) throw new AppError("Événement non trouvé", 404)

  return prisma.evaluation.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true } } }
  })
}

export async function deleteEvaluation(id: number, userId: number) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id } })
  if (!evaluation) throw new AppError("Note non trouvé", 404)
  if (evaluation.userId !== userId) throw new AppError("Pas votre note", 403)

  return prisma.evaluation.delete({ where: { id } })
}