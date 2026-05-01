import { FastifyInstance } from "fastify"
import * as categoryController from "../controllers/category.controller"

export async function categoryRoutes(app: FastifyInstance) {
  const a = app as any

  // Public
  app.get("/categories", {
    schema: { tags: ["Catégorie"] }
  }, categoryController.getCategories)

  app.get("/categories/:id", {
    schema: { tags: ["Catégorie"] }
  }, categoryController.getCategoryById)

  // Admin

  app.get("/categories/all", {
    schema: { tags: ["Catégorie"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authorize(["ADMIN"])]
  }, categoryController.getAllCategories)

  app.post("/categories", {
    schema: { tags: ["Catégorie"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authorize(["ADMIN"])]
  }, categoryController.createCategory)

  app.put("/categories/:id", {
    schema: { tags: ["Catégorie"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authorize(["ADMIN"])]
  }, categoryController.updateCategory)

  app.delete("/categories/:id", {
    schema: { tags: ["Catégorie"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authorize(["ADMIN"])]
  }, categoryController.deleteCategory)

  app.post("/categories/:id/restore", {
    schema: { tags: ["Catégorie"], security: [{ bearerAuth: [] }] },
    preHandler: [a.authorize(["ADMIN"])]
  }, categoryController.restoreCategory)
}