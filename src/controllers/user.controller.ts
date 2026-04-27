import { FastifyRequest, FastifyReply } from "fastify"
import * as userService from "../services/user.service"
 
export async function getUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const users = await userService.getUsers()
  return reply.send(users)
}