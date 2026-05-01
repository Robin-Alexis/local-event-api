import { FastifyRequest, FastifyReply } from "fastify"
import * as categoryService from "../services/category.service"
import { createCategorySchema, updateCategorySchema, filterCategorySchema } from "../schemas/category.schema"

export async function getCategories(request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await categoryService.getCategories(false))
}

export async function getAllCategories(request: FastifyRequest, reply: FastifyReply) {
  return reply.send(await categoryService.getCategories(true))
}

export async function getCategoryById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  return reply.send(await categoryService.getCategoryById(Number(id)))
}

export async function createCategory(request: FastifyRequest, reply: FastifyReply) {
  const data = createCategorySchema.parse(request.body)
  return reply.status(201).send(await categoryService.createCategory(data))
}

export async function updateCategory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const data = updateCategorySchema.parse(request.body)
  return reply.send(await categoryService.updateCategory(Number(id), data))
}

export async function deleteCategory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  await categoryService.deleteCategory(Number(id))
  return reply.status(204).send()
}

export async function restoreCategory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  return reply.send(await categoryService.restoreCategory(Number(id)))
}