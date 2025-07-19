import { z } from 'zod'

export const EventSchema = z.object({
    id: z.string(),
    nombre: z.string().min(1).max(20),
    descripcion: z.string().max(100).optional(),
    cantidad: z.number().positive(),
    fecha: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Fecha inválida',
    }),
    tipo: z.enum(['ingreso', 'egreso']),
    adjunto: z.string().optional(), // base64 opcional
})

export type EventType = z.infer<typeof EventSchema>

export const CreateEventSchema = EventSchema.omit({
    id: true,
})

export type CreateEventType = z.infer<typeof CreateEventSchema>

export const UpdateEventSchema = EventSchema.partial().extend({
    id: z.string(),
})

export type UpdateEventType = z.infer<typeof UpdateEventSchema>
