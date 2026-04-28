import { FastifyInstance } from "fastify";
import * as eventController from "../controllers/event.controller";

export async function eventRoutes(app: FastifyInstance) {
    const a = app as any;

    // Public
    app.get("/events", eventController.getEvents);
    app.get("/events/:id", eventController.getEventById);

    // Connecté
    app.post("/events", {
        preHandler: [a.authenticate]
    }, eventController.createEvent);

    app.get("/events/registered", {
    preHandler: [a.authenticate]
    }, eventController.getRegisteredEvents);

    app.put("/events/:id", {
        preHandler: [a.authenticate]
    }, eventController.updateEvent);

    app.delete("/events/:id", {
        preHandler: [a.authenticate]
    }, eventController.deleteEvent);

    app.get("/my-events", {
        preHandler: [a.authenticate]
    }, eventController.getMyEvents);

    app.post("/events/:id/join", {
        preHandler: [a.authenticate]
    }, eventController.joinEvent);

    app.post("/events/:id/leave", {
        preHandler: [a.authenticate]
    }, eventController.leaveEvent);
}