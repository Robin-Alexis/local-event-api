import { FastifyInstance } from "fastify"
import * as evaluationController from "../controllers/evaluation.controller"

export async function evaluationRoutes(app: FastifyInstance) {
  const a = app as any

  // Public
  app.get("/events/:id/evaluations", {
        schema: { tags: ["Événement"] }
    }, evaluationController.getEventEvaluations)

  // Auth requise
  app.post("/events/:id/evaluations", {
    schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, evaluationController.createEvaluation)

  app.delete("/evaluations/:id", {
    schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, evaluationController.deleteEvaluation)
}