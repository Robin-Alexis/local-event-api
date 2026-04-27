import { FastifyInstance } from "fastify"
import * as userController from "../controllers/user.controller"
 
export async function userRoutes(app: FastifyInstance) {
 
  app.get("/users", userController.getUsers)
 
}