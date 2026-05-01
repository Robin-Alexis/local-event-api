import { FastifyRequest, FastifyReply } from "fastify"
import * as historicService from "../services/historic.service"

export async function getMyHistoric(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id
  return reply.send(await historicService.getMyHistoric(userId))
}

export async function getAllHistorics(request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await historicService.getAllHistorics())
}

export async function deleteHistoric(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  await historicService.deleteHistoric(Number(id))
  return reply.status(204).send()
}