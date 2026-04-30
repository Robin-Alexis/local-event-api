import { createEvaluation, getEventEvaluations, deleteEvaluation } from "../services/evaluation.service"
import { AppError } from "../errors/AppError"
import { prisma } from "../prisma"

jest.mock("../prisma", () => ({
  prisma: {
    event: {
      findUnique: jest.fn()
    },
    participation: {
      findUnique: jest.fn()
    },
    evaluation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    }
  }
}))

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
}

const mockParticipation = {
  id: 1,
  userId: 2,
  eventId: 1
}

const mockEvaluation = {
  id: 1,
  note: 4,
  comment: "Super événement",
  userId: 2,
  eventId: 1
}

describe("EvaluationService", () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createEvaluation", () => {
    it("should create an evaluation", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent)
      ;(prisma.participation.findUnique as jest.Mock).mockResolvedValue(mockParticipation)
      ;(prisma.evaluation.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.evaluation.create as jest.Mock).mockResolvedValue(mockEvaluation)

      const result = await createEvaluation(2, 1, { note: 4, comment: "Super événement" })

      expect(prisma.evaluation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ note: 4, userId: 2, eventId: 1 })
        })
      )
      expect(result).toEqual(mockEvaluation)
    })

    it("Doit retourner une erreur si l'événement n'existe pas", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(createEvaluation(2, 99, { note: 4 }))
        .rejects.toThrow(new AppError("Événement non trouvé", 404))
    })

    it("Doit retourner une erreur si l'utilisateur n'y a pas participer", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent)
      ;(prisma.participation.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(createEvaluation(2, 1, { note: 4 }))
        .rejects.toThrow(new AppError("Vous devez participer à l'évènement pour pouvoir l'évaluer", 403))
    })

    it("Doit retourner une erreur si l'utilisateur a déjà donner une note", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent)
      ;(prisma.participation.findUnique as jest.Mock).mockResolvedValue(mockParticipation)
      ;(prisma.evaluation.findFirst as jest.Mock).mockResolvedValue(mockEvaluation)

      await expect(createEvaluation(2, 1, { note: 4 }))
        .rejects.toThrow(new AppError("Vous avez déjà évaluer cet évènement", 409))
    })
  })

  describe("getEventEvaluations", () => {
    it("Doit retouruner les notes de l'événement via son id", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent)
      ;(prisma.evaluation.findMany as jest.Mock).mockResolvedValue([mockEvaluation])

      const result = await getEventEvaluations(1)

      expect(prisma.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { eventId: 1 } })
      )
      expect(result).toEqual([mockEvaluation])
    })

    it("Doit retourner une erreur si l'événement n'existe pas", async () => {
      ;(prisma.event.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(getEventEvaluations(99))
        .rejects.toThrow(new AppError("Événement non trouvé", 404))
    })
  })

  describe("deleteEvaluation", () => {
    it("Doit supprimer sa note si créateur", async () => {
      ;(prisma.evaluation.findUnique as jest.Mock).mockResolvedValue(mockEvaluation)
      ;(prisma.evaluation.delete as jest.Mock).mockResolvedValue(mockEvaluation)

      await deleteEvaluation(1, 2)

      expect(prisma.evaluation.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it("Doit retourner une erreur si la note n'existe pas", async () => {
      ;(prisma.evaluation.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(deleteEvaluation(99, 2))
        .rejects.toThrow(new AppError("Note non trouvé", 404))
    })

    it("Doit retourner une erreur si ce n'est pas le créateur", async () => {
      ;(prisma.evaluation.findUnique as jest.Mock).mockResolvedValue(mockEvaluation)

      await expect(deleteEvaluation(1, 99))
        .rejects.toThrow(new AppError("Pas votre note", 403))
    })
  })
})