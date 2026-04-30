import { FastifyInstance } from "fastify";
import * as authController from "../controllers/auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", {
        schema: { tags: ["Authentification"] }
    }, authController.register);

  app.post("/auth/login", {
        schema: { tags: ["Authentification"] }
    }, authController.login);

  app.post("/auth/refresh", {
        schema: { tags: ["Authentification"] }
    }, authController.refresh);
  
  app.post("/auth/logout", {
    schema: { tags: ["Authentification"], security: [{ bearerAuth: [] }] },
    preHandler: [(app as any).authenticate]
  }, authController.logout);
}