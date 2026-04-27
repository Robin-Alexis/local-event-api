import { FastifyRequest, FastifyReply } from "fastify";
import * as authService from "../services/auth.service";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const data = registerSchema.parse(request.body);
  const user = await authService.registerUser(data);
  return reply.status(201).send(user);
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const data = loginSchema.parse(request.body);
  const user = await authService.loginUser(data);
  const token = request.server.jwt.sign({ id: user.id, email: user.email, role: user.role });
  return reply.send({ token });
}