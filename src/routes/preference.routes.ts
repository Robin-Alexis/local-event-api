import { FastifyInstance } from "fastify"
import * as preferenceController from "../controllers/preference.controller"

export async function preferenceRoutes(app: FastifyInstance) {
  const a = app as any

  app.get("/preferences", {
    schema: { tags: ["Préférence"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, preferenceController.getPreferences)

  app.post("/preferences", {
    schema: { tags: ["Préférence"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, preferenceController.addPreference)

  app.delete("/preferences/:id", {
    schema: { tags: ["Préférence"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authenticate]
  }, preferenceController.deletePreference)
}