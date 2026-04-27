import { FastifyInstance } from "fastify"
import * as userController from "../controllers/user.controller"
 
export async function userRoutes(app: FastifyInstance) {
 
  // Connecté + Admin
  app.get("/users", {
    preHandler: [(app as any).authorize(["ADMIN"])]
  }, userController.getUsers);

  app.get("/users/:id", {
    preHandler: [(app as any).authorize(["ADMIN"])]
  }, userController.getUserById);

  app.delete("/users/:id", {
    preHandler: [(app as any).authorize(["ADMIN"])]
  }, userController.deleteUser);


}