import { getUsers, getUserById, deleteUser } from "../services/user.service"
import { AppError } from "../errors/AppError"
import { prisma } from "../prisma"

jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    }
  }
}))

const mockUser = {
  id: 1,
  name: "Alexis",
  email: "alexis@test.com",
  role: "USER",
  createAt: new Date(),
  location: null,
  firstName: null,
  lastName: null,
  position: null
}

describe("UserService", () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getUsers", () => {
    it("should return all users", async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser])

      const result = await getUsers()

      expect(prisma.user.findMany).toHaveBeenCalled()
      expect(result).toEqual([mockUser])
    })

    it("should return empty array if no users", async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const result = await getUsers()
      expect(result).toEqual([])
    })
  })

  describe("getUserById", () => {
    it("should return user by id", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await getUserById(1)

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      )
      expect(result).toEqual(mockUser)
    })

    it("Doit retourner une erreur si l'utilisateur n'existe pas", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(getUserById(99))
        .rejects.toThrow(new AppError("L'utilisateur n'existe pas", 404))
    })
  })

  describe("deleteUser", () => {
    it("should delete user by id", async () => {
      ;(prisma.user.delete as jest.Mock).mockResolvedValue(mockUser)

      await deleteUser(1)

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })
  })
})