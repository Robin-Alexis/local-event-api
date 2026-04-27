import fp from "fastify-plugin"
import jwt from "@fastify/jwt"
 
export default fp(async (app) => {
  app.register(jwt, {
    secret: "supersecret"
  })
 
  app.decorate("authenticate", async (request: any, reply: any) => {
    await request.jwtVerify()
  })
})