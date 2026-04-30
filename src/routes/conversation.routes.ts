import { FastifyInstance } from "fastify"
import * as conversationController from "../controllers/conversation.controller"

export async function conversationRoutes(app: FastifyInstance) {
  const a = app as any

  // Auth requise
  app.get("/conversations", {
    schema: { tags: ["Conversation"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, conversationController.getMyConversations)

  app.get("/conversations/:id/messages", {
    schema: { tags: ["Conversation"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, conversationController.getConversationMessages)

  app.post("/conversations/:userId", {
    schema: { tags: ["Conversation"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, conversationController.getOrCreateConversation)

  app.post("/conversations/:id/messages", {
    schema: { tags: ["Conversation"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, conversationController.sendMessage)

  app.delete("/messages/:id", {
    schema: { tags: ["Conversation"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, conversationController.deleteMessage)
}