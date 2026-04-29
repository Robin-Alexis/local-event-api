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
  

  const accessToken = request.server.jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    { expiresIn: "15m" }
  );

  const refreshToken = await authService.generateRefreshToken(user.id);

  return reply.send({ accessToken, refreshToken });
}

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  const { refreshToken } = request.body as { refreshToken: string };
  const user = await authService.refreshAccessToken(refreshToken);

  const accessToken = request.server.jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    { expiresIn: "15m" }
  );

  return reply.send({ accessToken });
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).id;
  await authService.logout(userId);
  return reply.status(204).send();
}