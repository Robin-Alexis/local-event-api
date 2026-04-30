import {
  getOrCreateConversation,
  sendMessage,
  getMyConversations,
  getConversationMessages,
  deleteMessage
} from "../services/conversation.service"
import { AppError } from "../errors/AppError"
import { prisma } from "../prisma"

jest.mock("../prisma", () => ({
  prisma: {
    conversation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn()
    },
    message: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    }
  }
}))

const mockUser1 = { id: 1, name: "Alexis", email: "alexis@test.com" }
const mockUser2 = { id: 2, name: "Marie", email: "marie@test.com" }

const mockConversation = {
  id: 1,
  user1Id: 1,
  user2Id: 2,
  createdAt: new Date(),
  user1: mockUser1,
  user2: mockUser2,
  messages: []
}

const mockMessage = {
  id: 1,
  content: "Bonjour !",
  createdAt: new Date(),
  conversationId: 1,
  senderId: 1
}

describe("ConversationService", () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getOrCreateConversation", () => {
    it("Doit retourner la conversation existante", async () => {
      ;(prisma.conversation.findFirst as jest.Mock).mockResolvedValue(mockConversation)

      const result = await getOrCreateConversation(1, 2)

      expect(prisma.conversation.findFirst).toHaveBeenCalled()
      expect(prisma.conversation.create).not.toHaveBeenCalled()
      expect(result).toEqual(mockConversation)
    })

    it("should create conversation if not exists", async () => {
      ;(prisma.conversation.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.conversation.create as jest.Mock).mockResolvedValue(mockConversation)

      const result = await getOrCreateConversation(1, 2)

      expect(prisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { user1Id: 1, user2Id: 2 }
        })
      )
      expect(result).toEqual(mockConversation)
    })

    it("Doit retourner si l'utilisateur essaye de converser avec lui même", async () => {
      await expect(getOrCreateConversation(1, 1))
        .rejects.toThrow(new AppError("Vous ne pouvez pas créer de conversation avec vous même", 400))
    })
  })

  describe("sendMessage", () => {
    it("Doit envoyer un message", async () => {
      ;(prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation)
      ;(prisma.message.create as jest.Mock).mockResolvedValue(mockMessage)

      const result = await sendMessage(1, 1, "Bonjour !")

      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { content: "Bonjour !", conversationId: 1, senderId: 1 }
        })
      )
      expect(result).toEqual(mockMessage)
    })

    it("Doit retourner une erreur si la conversion n'est pas trouvée", async () => {
      ;(prisma.conversation.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(sendMessage(99, 1, "Bonjour !"))
        .rejects.toThrow(new AppError("Conversation non trouvée", 404))
    })

    it("Doit retourner une erreur si l'utilisateur ne fait pas partie de la conversation", async () => {
      ;(prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation)

      await expect(sendMessage(1, 99, "Bonjour !"))
        .rejects.toThrow(new AppError("Pas votre conversation", 403))
    })
  })

  describe("getMyConversations", () => {
    it("Doit retourne les conversations de l'utilisateur", async () => {
      ;(prisma.conversation.findMany as jest.Mock).mockResolvedValue([mockConversation])

      const result = await getMyConversations(1)

      expect(prisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ user1Id: 1 }, { user2Id: 1 }]
          }
        })
      )
      expect(result).toEqual([mockConversation])
    })

    it("Doit retourner une liste vide si l'utilisateur n'a aucune conversation", async () => {
      ;(prisma.conversation.findMany as jest.Mock).mockResolvedValue([])

      const result = await getMyConversations(1)
      expect(result).toEqual([])
    })
  })

  describe("getConversationMessages", () => {
    it("Doit retourne les messages de la conversation", async () => {
      ;(prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation)
      ;(prisma.message.findMany as jest.Mock).mockResolvedValue([mockMessage])

      const result = await getConversationMessages(1, 1)

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { conversationId: 1 } })
      )
      expect(result).toEqual([mockMessage])
    })

    it("Doit retourner une erreur si la conversation n'existe pas", async () => {
      ;(prisma.conversation.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(getConversationMessages(99, 1))
        .rejects.toThrow(new AppError("Conversation non trouvée", 404))
    })

    it("Doit retourner si l'utilisateur ne fait pas partie de la conversation", async () => {
      ;(prisma.conversation.findUnique as jest.Mock).mockResolvedValue(mockConversation)

      await expect(getConversationMessages(1, 99))
        .rejects.toThrow(new AppError("Pas votre conversation", 403))
    })
  })

  describe("deleteMessage", () => {
    it("Doit supprimer le message si c'est l'expéditeur", async () => {
      ;(prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage)
      ;(prisma.message.delete as jest.Mock).mockResolvedValue(mockMessage)

      await deleteMessage(1, 1)

      expect(prisma.message.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it("Doit retourner une erreur si le message n'existe pas", async () => {
      ;(prisma.message.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(deleteMessage(99, 1))
        .rejects.toThrow(new AppError("Message non trouvé", 404))
    })

    it("Doit retourner une erreur si vous n'êtes pas l'expéditeur", async () => {
      ;(prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage)

      await expect(deleteMessage(1, 99))
        .rejects.toThrow(new AppError("Pas votre message", 403))
    })
  })
})