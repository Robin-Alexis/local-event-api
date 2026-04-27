import { FastifyRequest, FastifyReply } from "fastify";
import * as userService from "../services/user.service";

export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  const users = await userService.getUsers();
  return reply.send(users);
}

export async function getUserById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const user = await userService.getUserById(Number(id))
  return reply.send(user)
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await userService.deleteUser(Number(id));
  return reply.status(204).send();
}
