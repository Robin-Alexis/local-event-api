import { z } from "zod"

export const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  parentId: z.number().int().optional()
})

export const updateCategorySchema = createCategorySchema.partial()

export const filterCategorySchema = z.object({
  deleted: z.string().optional() // "true" pour voir les supprimées
})