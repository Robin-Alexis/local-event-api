import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  joinEvent,
  leaveEvent,
  getRegisteredEvents,
} from "../services/event.service";
import { AppError } from "../errors/AppError";
import { prisma } from "../prisma";
import { title } from "node:process";

jest.mock("../prisma", () => ({
  prisma: {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    participation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockEvent = {
  id: 1,
  title: "Hackathon Web3",
  description: "Compétition de développement autour de la blockchain",
  eventDate: new Date("2026-04-30"),
  localtion: "Caen",
  createdAt: new Date(),
  maxParticipants: 60,
  position: null,
  userId: 1,
  categoryId: 4,
};

const mockParticipation = {
  id: 1,
  userId: 2,
  eventId: 1,
};

describe("EventService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEvents", () => {
    it("Doit retourner tous les événements sans filtres", async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);

      const result = await getEvents({});

      expect(prisma.event.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockEvent]);
    });

    it("Doit filtrer par catégorie", async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);

      await getEvents({ categoryId: 1 });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 1 }),
        }),
      );
    });

    it("Doit filtrer par location", async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);

      await getEvents({ location: "Caen" });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: { contains: "Caen", mode: "insensitive" },
          }),
        }),
      );
    });
  });

  describe("getEventById", () => {
    it("Doit retourner l'événement par son id", async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const result = await getEventById(1);
      expect(result).toEqual(mockEvent);
    });

    it("Doit retourner une erreur si l'événement n'existe pas", async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getEventById(99)).rejects.toThrow(
        new AppError("Événement non trouvé", 404),
      );
    });
  });

  describe("createEvent", () => {
    it("Doit créer un événement", async () => {
      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await createEvent(1, {
        title: "Hackathon Web3",
        description: "Compétition de développement autour de la blockchain",
        eventDate: new Date("2026-04-30"),
        location: "Caen",
        maxParticipants: 60,
        categoryId: 4,
      });

      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 1 }),
        }),
      );
      expect(result).toEqual(mockEvent);
    });
  });

  describe("updateEvent", () => {
    it("Doit modifier l'événement du créateur", async () => {
        ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent)
        ;(prisma.event.update as jest.Mock).mockResolvedValue({ ...mockEvent, title: "Modifié"})

        const result = await updateEvent(1, 1, { title: "Modifié"})
        expect(result.title).toBe("Modifié")
    })

    it("Doit retourner une erreur si l'événement n'existe pas", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateEvent(99, 1, { title: "Modifié" }))
        .rejects.toThrow(new AppError("Événement non trouvé", 404))
    })

    it("Doit retourner une erreur si la personnen n'est pas le créateur", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent)

      await expect(updateEvent(1, 99, { title: "Modifié" }))
        .rejects.toThrow(new AppError("Pas votre événement", 403))
    })
  })

  describe("deleteEvent", () => {
    it("Doit supprimer l'événement si créateur", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent)
      ;(prisma.event.delete as jest.Mock).mockResolvedValue(mockEvent)

      await deleteEvent(1, 1)
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it("Doit retourner une erreur si l'événement n'existe pas", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(deleteEvent(99, 1))
        .rejects.toThrow(new AppError("Événement non trouvé", 404))
    })

    it("Doit retourner une erreur si la personne n'est pas le créateur", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent)

      await expect(deleteEvent(1, 99))
        .rejects.toThrow(new AppError("Pas votre événement", 403))
    })
  })

  describe("joinEvent", () => {
    it("Doit rejoindre l'événement", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue({
        ...mockEvent,
        participations: []
      })
      ;(prisma.participation.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.participation.create as jest.Mock).mockResolvedValue(mockParticipation)

      const result = await joinEvent(1, 2)
      expect(result).toEqual(mockParticipation)
    })

    it("Doit retourner une erreur si l'événement n'existe pas", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(joinEvent(99, 2))
        .rejects.toThrow(new AppError("Événement non trouvé", 404))
    })

    it("Doit retourner une erreur si l'événement est plein", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue({
        ...mockEvent,
        maxParticipants: 1,
        participations: [mockParticipation]
      })

      await expect(joinEvent(1, 2))
        .rejects.toThrow(new AppError("L'événement est plein", 400))
    })

    it("Doit retourner une erreur si l'utilisateur est déjà inscrit à l'événement", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue({
        ...mockEvent,
        participations: []
      })
      ;(prisma.participation.findUnique as jest.Mock).mockResolvedValue(mockParticipation)

      await expect(joinEvent(1, 2))
        .rejects.toThrow(new AppError("Déjà enregistrer", 409))
    })
  })

  describe("leaveEvent", () => {
    it("Doit quitter l'événement", async () => {
      ;(prisma.participation.findUnique as jest.Mock).mockResolvedValue(mockParticipation)
      ;(prisma.participation.delete as jest.Mock).mockResolvedValue(mockParticipation)

      await leaveEvent(1, 2)
      expect(prisma.participation.delete).toHaveBeenCalled()
    })

    it("Doit retourner une erreur si l'utilisateur n'est pas enregistrer", async () => {
      ;(prisma.participation.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(leaveEvent(1, 2))
        .rejects.toThrow(new AppError("Non enregistrer", 404))
    })
  })

  describe("getMyEvents", () => {
    it("Doit retourner les événements de l'utilisateur", async () => {
      ;(prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent])

      const result = await getMyEvents(1)

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1 } })
      )
      expect(result).toEqual([mockEvent])
    })
  })

  describe("getRegisteredEvents", () => {
    it("Doit retourner les événements auxquels l'utilisateur est inscrit", async () => {
      const mockData = [{ ...mockParticipation, event: mockEvent }]
      ;(prisma.participation.findMany as jest.Mock).mockResolvedValue(mockData)

      const result = await getRegisteredEvents(2)

      expect(prisma.participation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 2 } })
      )
      expect(result).toEqual(mockData)
    })
  })
});
