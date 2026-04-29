import { FastifyInstance } from "fastify"
import * as evaluationController from "../controllers/evaluation.controller"

export async function evaluationRoutes(app: FastifyInstance) {
  const a = app as any

  // Public
  app.get("/events/:id/evaluations", evaluationController.getEventEvaluations)

  // Auth requise
  app.post("/events/:id/evaluations", {
    preHandler: [a.authenticate]
  }, evaluationController.createEvaluation)

  app.delete("/evaluations/:id", {
    preHandler: [a.authenticate]
  }, evaluationController.deleteEvaluation)
}