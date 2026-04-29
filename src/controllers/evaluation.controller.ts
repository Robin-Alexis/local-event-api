import { FastifyRequest, FastifyReply } from "fastify"
import * as evaluationService from "../services/evaluation.service"
import { createEvaluationSchema } from "../schemas/evaluation.schema"

export async function createEvaluation(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const userId = (request.user as any).id
  const data = createEvaluationSchema.parse(request.body)
  return reply.status(201).send(await evaluationService.createEvaluation(userId, Number(id), data))
}

export async function getEventEvaluations(request: FastifyRequest, reply: FastifyReply) {
    const {id} = request.params as {id: string}
    return reply.send(await evaluationService.getEventEvaluations(Number(id)))
}

export async function deleteEvaluation(request: FastifyRequest, reply: FastifyReply) {
    const {id} = request.params as {id: string}
    const userId = (request.user as any).id
    await evaluationService.deleteEvaluation(Number(id), userId)
    return reply.status(204).send()
}