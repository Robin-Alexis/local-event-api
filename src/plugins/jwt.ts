import fp from "fastify-plugin"
import jwt from "@fastify/jwt"
import { AppError } from "../errors/AppError"

export default fp(async (app) => {
  app.register(jwt, {
    secret: "supersecret"
  });

  app.decorate("authenticate", async (request: any, reply: any) => {
    await request.jwtVerify()
  });

  app.decorate("authorize", (roles: string[]) => {
    return async (request: any, reply: any) => {
      await request.jwtVerify()
      const userRole = request.user.role
      if (!roles.includes(userRole)) {
        throw new AppError("Access denied", 403)
      }
    }
  });
})