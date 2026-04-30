import fp from "fastify-plugin"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"

export default fp(async (app) => {
  app.register(swagger, {
    openapi: {
      info: {
        title: "Local Events API",
        description: "API pour la gestion d'événements locaux",
        version: "1.0.0"
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      }
    }
  })

  app.register(swaggerUi, {
    routePrefix: "/documentation"
  })
})