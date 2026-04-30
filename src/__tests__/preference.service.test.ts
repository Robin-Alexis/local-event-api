import { getPreferences, addPreferences, deletePreference } from "../services/preference.service"
import { AppError } from "../errors/AppError"
import { prisma } from "../prisma"

jest.mock("../prisma", () => ({
  prisma: {
    preference: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createMany: jest.fn(),
      delete: jest.fn()
    },
    category: {
      findMany: jest.fn()
    }
  }
}))

const mockCategory = {
  id: 1,
  name: "Musique",
  description: "Concerts, festivals",
  parentId: null
}

const mockPreference = {
  id: 1,
  userId: 1,
  categoryId: 1,
  category: mockCategory
}

describe("PreferenceService", () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getPreferences", () => {
    it("Doit retourner les préférences de l'utilisateur", async () => {
      ;(prisma.preference.findMany as jest.Mock).mockResolvedValue([mockPreference])

      const result = await getPreferences(1)

      expect(prisma.preference.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1 } })
      )
      expect(result).toEqual([mockPreference])
    })

    it("Doit retourner un tableau vide si aucune préférence de l'utilisateur", async () => {
      ;(prisma.preference.findMany as jest.Mock).mockResolvedValue([])

      const result = await getPreferences(1)
      expect(result).toEqual([])
    })
  })

  describe("addPreferences", () => {
    it("Doit ajouter une nouvelle préférence", async () => {
      ;(prisma.category.findMany as jest.Mock).mockResolvedValue([mockCategory])
      ;(prisma.preference.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockPreference])

      ;(prisma.preference.createMany as jest.Mock).mockResolvedValue({ count: 1 })

      const result = await addPreferences(1, [1])

      expect(prisma.preference.createMany).toHaveBeenCalledWith({
        data: [{ userId: 1, categoryId: 1 }]
      })
      expect(result).toEqual([mockPreference])
    })

    it("Doit retourner une erreur si une ou plusieurs catégorie n'existe pas", async () => {
      ;(prisma.category.findMany as jest.Mock).mockResolvedValue([])

      await expect(addPreferences(1, [1, 2]))
        .rejects.toThrow(new AppError("La ou les catégories n'ont pas été trouvées", 404))
    })

    it("Doit retourner une erreur si les préférences existe déjà", async () => {
      ;(prisma.category.findMany as jest.Mock).mockResolvedValue([mockCategory])
      ;(prisma.preference.findMany as jest.Mock).mockResolvedValue([mockPreference])

      await expect(addPreferences(1, [1]))
        .rejects.toThrow(new AppError("Toutes les préférences existe déjà", 409))
    })

    it("Ne devrait ajouter que des préférences inexistantes", async () => {
      const mockCategory2 = { ...mockCategory, id: 2, name: "Sport" }

      ;(prisma.category.findMany as jest.Mock).mockResolvedValue([mockCategory, mockCategory2])
      ;(prisma.preference.findMany as jest.Mock)
        .mockResolvedValueOnce([mockPreference]) 
        .mockResolvedValueOnce([{ ...mockPreference, categoryId: 2 }])

      ;(prisma.preference.createMany as jest.Mock).mockResolvedValue({ count: 1 })

      await addPreferences(1, [1, 2])

      expect(prisma.preference.createMany).toHaveBeenCalledWith({
        data: [{ userId: 1, categoryId: 2 }] // seulement categoryId 2
      })
    })
  })

  describe("deletePreference", () => {
    it("Doit supprimer sa préférence si créateur", async () => {
      ;(prisma.preference.findUnique as jest.Mock).mockResolvedValue(mockPreference)
      ;(prisma.preference.delete as jest.Mock).mockResolvedValue(mockPreference)

      await deletePreference(1, 1)

      expect(prisma.preference.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it("Doit retourner une erreur si la préférence n'existe pas", async () => {
      ;(prisma.preference.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(deletePreference(99, 1))
        .rejects.toThrow(new AppError("Préférence non trouvé", 404))
    })

    it("should throw if not owner", async () => {
      ;(prisma.preference.findUnique as jest.Mock).mockResolvedValue(mockPreference)

      await expect(deletePreference(1, 99))
        .rejects.toThrow(new AppError("Cette préférence n'est pas la votre", 403))
    })
  })
})