import { addHistoric, getMyHistoric, getAllHistorics, deleteHistoric } from "../services/historic.service"
import { AppError } from "../errors/AppError"
import { prisma } from "../prisma"

jest.mock("../prisma", () => ({
  prisma: {
    historic: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    }
  }
}))

const mockHistoric = {
  id: 1,
  opType: "JOIN",
  opAt: new Date(),
  userId: 1,
  eventId: 1
}

const mockHistoricWithRelations = {
  ...mockHistoric,
  user: { id: 1, name: "Alexis", email: "alexis@test.com" },
  event: { id: 1, title: "Concert Jazz", category: { id: 1, name: "Musique" } }
}

describe("HistoricService", () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("addHistoric", () => {
    it("Doit enregistrer une action dans l'historique", async () => {
      ;(prisma.historic.create as jest.Mock).mockResolvedValue(mockHistoric)

      const result = await addHistoric(1, 1, "JOIN")

      expect(prisma.historic.create).toHaveBeenCalledWith({
        data: { userId: 1, eventId: 1, opType: "JOIN" }
      })
      expect(result).toEqual(mockHistoric)
    })
  })

  describe("getMyHistoric", () => {
    it("Doit retourner l'historique de l'utilisateur", async () => {
      ;(prisma.historic.findMany as jest.Mock).mockResolvedValue([mockHistoricWithRelations])

      const result = await getMyHistoric(1)

      expect(prisma.historic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1 } })
      )
      expect(result).toEqual([mockHistoricWithRelations])
    })

    it("Doit retourner un tableau vide si pas d'historique", async () => {
      ;(prisma.historic.findMany as jest.Mock).mockResolvedValue([])

      const result = await getMyHistoric(1)
      expect(result).toEqual([])
    })
  })

  describe("getAllHistorics", () => {
    it("Doit retourner tout l'historique global", async () => {
      ;(prisma.historic.findMany as jest.Mock).mockResolvedValue([mockHistoricWithRelations])

      const result = await getAllHistorics()

      expect(prisma.historic.findMany).toHaveBeenCalled()
      expect(result).toEqual([mockHistoricWithRelations])
    })
  })

  describe("deleteHistoric", () => {
    it("Doit supprimer une entrée de l'historique", async () => {
      ;(prisma.historic.findUnique as jest.Mock).mockResolvedValue(mockHistoric)
      ;(prisma.historic.delete as jest.Mock).mockResolvedValue(mockHistoric)

      await deleteHistoric(1)

      expect(prisma.historic.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it("Doit retourner une erreur si l'entrée n'existe pas", async () => {
      ;(prisma.historic.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(deleteHistoric(99))
        .rejects.toThrow(new AppError("Historique non trouvé", 404))
    })
  })
})