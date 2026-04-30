import fp from "fastify-plugin"
import scalarReference from "@scalar/fastify-api-reference"

export default fp(async (app) => {
  app.register(scalarReference, {
    routePrefix: "/docs",
    configuration: {
      title: "Local Events API",
      theme: "purple"
    }
  })
})