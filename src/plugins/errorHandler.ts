import { FastifyInstance } from "fastify"
import { ZodError } from "zod"
import { AppError } from "../errors/AppError"
 
export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
 
    // Erreurs Zod
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.issues
      })
    }
 
    // Erreurs applicatives
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.message
      })
    }
 
    // Erreurs inattendues
    request.log.error(error)
 
    return reply.status(500).send({
      error: "Internal Server Error"
    })
  })
}