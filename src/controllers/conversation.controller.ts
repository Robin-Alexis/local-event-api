import { FastifyRequest, FastifyReply } from "fastify"
import * as conversationService from "../services/conversation.service"
import { createMessageSchema } from "../schemas/conversation.schema"

export async function getOrCreateConversation(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.params as { userId: string }
  const currentUserId = (request.user as any).id
  return reply.send(await conversationService.getOrCreateConversation(currentUserId, Number(userId)))
}

export async function sendMessage(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const senderId = (request.user as any).id
  const { content } = createMessageSchema.parse(request.body)
  return reply.status(201).send(await conversationService.sendMessage(Number(id), senderId, content))
}

export async function getMyConversations(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id
  return reply.send(await conversationService.getMyConversations(userId))
}

export async function getConversationMessages(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const userId = (request.user as any).id
  return reply.send(await conversationService.getConversationMessages(Number(id), userId))
}

export async function deleteMessage(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const userId = (request.user as any).id
  await conversationService.deleteMessage(Number(id), userId)
  return reply.status(204).send()
}