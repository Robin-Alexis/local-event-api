import "dotenv/config";
import Fastify from "fastify"
import { prisma } from "./prisma"

const app = Fastify({ logger: true })

app.get("/posts", async () => {
    return prisma.post.findMany()
})

app.post("/posts", async (request, reply) => {
    const { title, content } = request.body as any

    const post = await prisma.post.create({
        data: { title, content }
    })

    reply.code(201)
    return post
})

app.listen({ port: 3000 }, () => {
    console.log("Server running on http://localhost:3000")
})