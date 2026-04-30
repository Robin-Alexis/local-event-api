import { FastifyInstance } from "fastify";
import * as eventController from "../controllers/event.controller";

export async function eventRoutes(app: FastifyInstance) {
    const a = app as any;

    // Public
    app.get("/events", {
        schema: { tags: ["Événement"] }
    }, eventController.getEvents);
    
    app.get("/events/:id", {
        schema: { tags: ["Événement"] }
    }, eventController.getEventById);

    // Connecté
    app.post("/events", {
        schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
        preHandler: [a.authenticate]
    }, eventController.createEvent);

    app.get("/events/registered", {
        schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
        preHandler: [a.authenticate]
    }, eventController.getRegisteredEvents);

    app.put("/events/:id", {
        schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
        preHandler: [a.authenticate]
    }, eventController.updateEvent);

    app.delete("/events/:id", {
        schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
        preHandler: [a.authenticate]
    }, eventController.deleteEvent);

    app.get("/my-events", {
        schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
        preHandler: [a.authenticate]
    }, eventController.getMyEvents);

    app.post("/events/:id/join", {
        schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
        preHandler: [a.authenticate]
    }, eventController.joinEvent);

    app.post("/events/:id/leave", {
        schema: { tags: ["Événement"], security: [{ bearerAuth: [] }] },
        preHandler: [a.authenticate]
    }, eventController.leaveEvent);
}