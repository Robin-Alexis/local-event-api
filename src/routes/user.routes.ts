import { FastifyInstance } from "fastify"
import * as userController from "../controllers/user.controller"
 
export async function userRoutes(app: FastifyInstance) {
 
  // Connecté + Admin
  app.get("/users", {
    schema: { tags: ["Utilisateur"], security: [{ bearerAuth: [] }] },
    preHandler: [(app as any).authorize(["ADMIN"])]
  }, userController.getUsers);

  app.get("/users/:id", {
    schema: { tags: ["Utilisateur"], security: [{ bearerAuth: [] }] },
    preHandler: [(app as any).authorize(["ADMIN"])]
  }, userController.getUserById);

  app.delete("/users/:id", {
    schema: { tags: ["Utilisateur"], security: [{ bearerAuth: [] }] },
    preHandler: [(app as any).authorize(["ADMIN"])]
  }, userController.deleteUser);


}