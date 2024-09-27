import "reflect-metadata";
import fastify from "fastify";
import { config } from "config";
import process from "process";
import { readFile } from "fs/promises";

const app = fastify();

app
  .get("/", (request, reply) => reply.status(200).send("OK"))
  .get("/health", async (request, reply) => {
    try {
      const meta = await readFile(`${__dirname}/build.json`, "utf-8");

      reply.send(meta);
    } catch {
      reply.status(500).send("Failed to read build.json");
    }
  })
  .setNotFoundHandler((request, reply) => reply.code(404).send("Not Found"))
  .listen({ port: config.PORT, host: "0.0.0.0" });

process.on("exit", () => {
  console.log("Exiting...");
  app.close();
});
