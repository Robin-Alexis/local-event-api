import { z } from "zod"

export const createEventSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    eventDate: z.string().transform(val => new Date(val)),
    location: z.string().optional(),
    maxParticipants: z.number().int().positive(),
    position: z.string().optional(),
    categoryId: z.number().int().positive()
})

export const updateEventSchema = createEventSchema.partial()

export const filterEventsSchema = z.object({
    categoryId: z.string().optional().transform((val) => val ? Number(val) : undefined),
    location: z.string().optional(),
    from: z.string().optional().transform(val => val ? new Date(val) : undefined),
    to: z.string().optional().transform(val => val ? new Date(val) : undefined),
})