import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"
import { userSelect } from "../dto/user.dto"

export async function getOrCreateConversation(user1Id: number, user2Id: number) {
  if (user1Id === user2Id) throw new AppError("Cannot create conversation with yourself", 400)

  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id, user2Id },
        { user1Id: user2Id, user2Id: user1Id }
      ]
    },
    include: {
      user1: { select: userSelect },
      user2: { select: userSelect },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: userSelect } }
      }
    }
  })

  if (existing) return existing

  return prisma.conversation.create({
    data: { user1Id, user2Id },
    include: {
      user1: { select: userSelect },
      user2: { select: userSelect },
      messages: true
    }
  })
}

export async function sendMessage(conversationId: number, senderId: number, content: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  })
  if (!conversation) throw new AppError("Conversation not found", 404)

  if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
    throw new AppError("Not your conversation", 403)
  }

  return prisma.message.create({
    data: { content, conversationId, senderId },
    include: { sender: { select: userSelect } }
  })
}

export async function getMyConversations(userId: number) {
  return prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    },
    include: {
      user1: { select: userSelect },
      user2: { select: userSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function getConversationMessages(conversationId: number, userId: number) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  })
  if (!conversation) throw new AppError("Conversation not found", 404)

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    throw new AppError("Not your conversation", 403)
  }

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: userSelect } }
  })
}

export async function deleteMessage(messageId: number, userId: number) {
  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) throw new AppError("Message not found", 404)
  if (message.senderId !== userId) throw new AppError("Not your message", 403)

  return prisma.message.delete({ where: { id: messageId } })
}