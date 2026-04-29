import { FastifyInstance } from "fastify";
import * as authController from "../controllers/auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);
  app.post("/auth/refresh", authController.refresh);
  
  app.post("/auth/logout", {
    preHandler: [(app as any).authenticate]
  }, authController.logout);
}