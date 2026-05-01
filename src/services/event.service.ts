import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";
import { userSelect } from "../dto/user.dto";
import { addHistoric } from "./historic.service";

export async function getEvents(filters: {
  categoryId?: number;
  location?: string;
  from?: Date;
  to?: Date;
}) {
  return prisma.event.findMany({
    where: {
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.location && {
        location: { contains: filters.location, mode: "insensitive" },
      }),
      ...(filters.from || filters.to
        ? {
            eventDate: {
              ...(filters.from && { gte: filters.from }),
              ...(filters.to && { lte: filters.to }),
            },
          }
        : {}),
    },
    include: { category: true, organizer: { select: userSelect } },
  });
}

export async function getEventById(id: number) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { category: true, organizer: { select: userSelect }, participations: true },
  });
  if (!event) throw new AppError("Événement non trouvé", 404);
  return event;
}

export async function createEvent(
  userId: number,
  data: {
    title: string;
    description: string;
    eventDate: Date;
    location?: string;
    maxParticipants: number;
    categoryId: number;
  },
) {
  const event = await prisma.event.create({
    data: { ...data, userId }
  });
  await addHistoric(userId, event.id, "CREATE");
  return event;
}

export async function updateEvent(id: number, userId: number, data: any) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError("Événement non trouvé", 404);
  if (event.userId !== userId) throw new AppError("Pas votre événement", 403);

  const updated = await prisma.event.update({ where: { id }, data });
  await addHistoric(userId, id, "UPDATE");
  return updated;
}

export async function deleteEvent(id: number, userId: number) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError("Événement non trouvé", 404);
  if (event.userId !== userId) throw new AppError("Pas votre événement", 403);

  await addHistoric(userId, id, "DELETE");
  return prisma.event.delete({ where: { id } });
}

export async function getMyEvents(userId: number) {
  return prisma.event.findMany({
    where: { userId },
    include: { category: true, organizer: { select: userSelect }, participations: true },
  });
}

export async function joinEvent(eventId: number, userId: number) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participations: true },
  });
  if (!event) throw new AppError("Événement non trouvé", 404);
  if (event.participations.length >= event.maxParticipants) {
    throw new AppError("L'événement est plein", 400);
  }

  const alreadyIn = await prisma.participation.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadyIn) throw new AppError("Déjà enregistrer", 409);

  const participation = await prisma.participation.create({ data: { userId, eventId } });
  await addHistoric(userId, eventId, "JOIN");
  return participation;
}

export async function leaveEvent(eventId: number, userId: number) {
  const participation = await prisma.participation.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!participation) throw new AppError("Non enregistrer", 404);

  const deleted = await prisma.participation.delete({
    where: { userId_eventId: { userId, eventId } },
  });
  await addHistoric(userId, eventId, "LEAVE");
  return deleted;
}

export async function getRegisteredEvents(userId: number) {
  return prisma.participation.findMany({
    where: { userId },
    include: {
      event: {
        include: { category: true, organizer: { select: userSelect } }
      }
    }
  });
}