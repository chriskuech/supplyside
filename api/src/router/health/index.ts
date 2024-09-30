import { FastifyInstance } from "fastify";
import { readFile } from "fs/promises";

export const mountHealth = async <App extends FastifyInstance>(app: App) =>
  app.get("/health", async (request, reply) => {
    try {
      const meta = await readFile(`${__dirname}/build.json`, "utf-8");

      reply.send(meta);
    } catch {
      reply.status(500).send("Failed to read build.json");
    }
  });
