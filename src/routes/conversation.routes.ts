import { FastifyInstance } from "fastify"
import * as conversationController from "../controllers/conversation.controller"

export async function conversationRoutes(app: FastifyInstance) {
  const a = app as any

  // Auth requise
  app.get("/conversations", {
    preHandler: [a.authenticate]
  }, conversationController.getMyConversations)

  app.get("/conversations/:id/messages", {
    preHandler: [a.authenticate]
  }, conversationController.getConversationMessages)

  app.post("/conversations/:userId", {
    preHandler: [a.authenticate]
  }, conversationController.getOrCreateConversation)

  app.post("/conversations/:id/messages", {
    preHandler: [a.authenticate]
  }, conversationController.sendMessage)

  app.delete("/messages/:id", {
    preHandler: [a.authenticate]
  }, conversationController.deleteMessage)
}