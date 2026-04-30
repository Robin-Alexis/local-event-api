import { FastifyRequest, FastifyReply } from "fastify";
import * as preferenceService from "../services/preference.service";
import { createPreferenceSchema } from "../schemas/preference.schema"

export async function getPreferences(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).id
    return reply.send(await preferenceService.getPreferences(userId))
}

export async function addPreference(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id
  const { categoryIds } = createPreferenceSchema.parse(request.body)
  return reply.status(201).send(await preferenceService.addPreferences(userId, categoryIds))
}

export async function deletePreference(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const userId = (request.user as any).id
    await preferenceService.deletePreference(Number(id), userId)
    return reply.status(204).send()
}