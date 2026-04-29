import { z } from "zod";

export const createEvaluationSchema = z.object({
    note: z.number().int().min(1).max(5),
    comment: z.string().optional()
})