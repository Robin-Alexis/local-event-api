import { FastifyRequest, FastifyReply } from "fastify";
import * as eventService from "../services/event.service";
import { createEventSchema , updateEventSchema, filterEventsSchema } from "../schemas/event.schema";

export async function getEvents(request: FastifyRequest, reply: FastifyReply) {
    const filters = filterEventsSchema.parse(request.query);
    const events = await eventService.getEvents(filters);
    return reply.send(events);
}

export async function getEventById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const event = await eventService.getEventById(Number(id))
    return reply.send(event)
}

export async function createEvent(request: FastifyRequest, reply: FastifyReply) {
  const data = createEventSchema.parse(request.body)
  const userId = (request.user as any).id
  return reply.status(201).send(await eventService.createEvent(userId, data))
}

export async function updateEvent(request: FastifyRequest, reply: FastifyReply) {
    const data = updateEventSchema.parse(request.body)
    const { id } = request.params as { id: string }
    const userId = (request.user as any).id
    return reply.send(await eventService.updateEvent(Number(id), userId, data))
}

export async function deleteEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const userId = (request.user as any).id
    await eventService.deleteEvent(Number(id), userId)
    return reply.status(204).send();
}

export async function getMyEvents(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id
    const events = await eventService.getMyEvents(userId)
    return reply.send(events);
}

export async function joinEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const userId = (request.user as any).id
    await eventService.joinEvent(Number(id), userId)
    return reply.status(201).send();
}

export async function leaveEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const userId = (request.user as any).id
    await eventService.leaveEvent(Number(id), userId)
    return reply.status(204).send();
}

export async function getRegisteredEvents(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id
  return reply.send(await eventService.getRegisteredEvents(userId))
}