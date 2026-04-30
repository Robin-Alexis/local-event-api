import { z } from "zod"

export const createPreferenceSchema = z.object({
  categoryIds: z.array(z.number().int()).min(1)
})