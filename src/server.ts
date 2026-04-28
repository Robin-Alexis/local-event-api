import "dotenv/config";
import Fastify from "fastify";
import { userRoutes } from "./routes/user.routes";
import { authRoutes } from "./routes/auth.routes";
import { eventRoutes } from "./routes/event.routes";
import jwtPlugin from "./plugins/jwt";
import { errorHandler } from "./plugins/errorHandler";

const app = Fastify({ logger: true });

app.register(jwtPlugin);
app.register(errorHandler);
app.register(userRoutes);
app.register(authRoutes);
app.register(eventRoutes);

app.listen({ port: 3000 }, () => {
  console.log("Server running on http://localhost:3000");
});