import fp from "fastify-plugin";
import swagger from "@fastify/swagger";

export default fp(async (app) => {
    app.register(swagger, {
        openapi: {
            info: {
                title: "Local Event API",
                description: "API pour la gestion d'événements locaux",
                version: "1.0.0"
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    })
})