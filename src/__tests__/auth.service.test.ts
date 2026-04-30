import bcrypt from "bcrypt";
import {
  registerUser,
  loginUser,
  generateRefreshToken,
  refreshAccessToken,
  logout,
} from "../services/auth.service";
import { AppError } from "../errors/AppError";
import { prisma } from "../prisma";

jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("bcrypt");

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockUser = {
  id: 1,
  name: "Alexis",
  email: "alexis@test.com",
  password: "alexis123",
  role: "USER",
  createAt: new Date(),
  location: null,
  maxDistace: null,
  position: null,
  firstName: null,
  lastName: null,
  identifyCard: null,
};

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("Doit enregistrer un nouvel utilisateur", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await registerUser({
        name: "Alexis",
        email: "alexis@test.com",
        password: "alexis123",
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "alexis@test.com" },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("alexis123", 10);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("Doit renvoyer une erreur si l'email existe déjà", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        registerUser({
          name: "Alexis",
          email: "alexis@test.com",
          password: "alexis123",
        }),
      ).rejects.toThrow(new AppError("L'email existe déjà", 409));
    });
  });

  describe("loginUser", () => {
    it("Doit connecté l'utilisateur avec des données valide", async () => {
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await loginUser({
        email: "alexis@test.com",
        password: "alexis123"
      })

      expect(result).toEqual(mockUser)
    })

    it("Doit renvoyer une erreur si l'utilisateur n'existe pas", async () => {
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(loginUser({
        email: "notfound@test.com",
        password: "123456"
      })).rejects.toThrow(new AppError("Invalid credentials", 401))
    })

    it("Doit renvoyer une erreur si le mot de passe est invalide", async () => {
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(loginUser({
        email: "alexis@test.com",
        password: "mauvaispassword"
      })).rejects.toThrow(new AppError("Invalid credentials", 401))
    })
  })

   describe("generateRefreshToken", () => {
    it("should generate and store a refresh token", async () => {
      ;(mockPrisma.refreshToken.create as jest.Mock).mockResolvedValue({})

      const token = await generateRefreshToken(1)

      expect(typeof token).toBe("string")
      expect(token).toHaveLength(128)
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled()
    })
  })

  describe("refreshAccessToken", () => {
    it("Doit retourner l'utilisateur pour un refresh token valide", async () => {
      ;(mockPrisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        token: "validtoken",
        expireAt: new Date(Date.now() + 100000),
        user: mockUser
      })

      const result = await refreshAccessToken("validtoken")
      expect(result).toEqual(mockUser)
    })

    it("Doit retourne une erreur si le refresh token n'est pas trouvé", async () => {
      ;(mockPrisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(refreshAccessToken("invalidtoken"))
        .rejects.toThrow(new AppError("Invalid refresh token", 401))
    })

    it("Doit retourner une erreur si le refresh token a expiré", async () => {
      ;(mockPrisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        token: "expiredtoken",
        expireAt: new Date(Date.now() - 100000),
        user: mockUser
      })
      ;(mockPrisma.refreshToken.delete as jest.Mock).mockResolvedValue({})

      await expect(refreshAccessToken("expiredtoken"))
        .rejects.toThrow(new AppError("Refresh token expired", 401))

      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: "expiredtoken" }
      })
    })
  })

  describe("logout", () => {
    it("Doit supprimer tous les refresh token de l'utilisateur", async () => {
      ;(mockPrisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })

      await logout(1)

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 }
      })
    })
  })
});
