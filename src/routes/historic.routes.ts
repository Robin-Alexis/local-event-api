import { FastifyInstance } from "fastify"
import * as historicController from "../controllers/historic.controller"

export async function historicRoutes(app: FastifyInstance) {
  const a = app as any

  app.get("/historics/me", {
    schema: { tags: ["Historique"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, historicController.getMyHistoric)

  app.get("/historics", {
    schema: { tags: ["Historique"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authorize(["ADMIN"])]
  }, historicController.getAllHistorics)

  app.delete("/historics/:id", {
    schema: { tags: ["Historique"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authorize(["ADMIN"])]
  }, historicController.deleteHistoric)
}