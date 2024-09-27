import "reflect-metadata";
import fastify from "fastify";
import { config } from "config";
import process from "process";
import { readFile } from "fs/promises";

const app = fastify();

app
  .get("/", (req, res) => {
    res.send("Hello World!");
  })
  .get("/health", async (req, res) => {
    try {
      const meta = await readFile(`${__dirname}/build.json`, "utf-8");

      res.send(meta);
    } catch {
      res.status(500).send("Failed to read build.json");
    }
  })
  .setNotFoundHandler((request, reply) => {
    reply.code(404).send("Not Found");
  })
  .listen({ port: config.PORT });

setInterval(() => {
  console.log("Hello World!");

  setTimeout(() => {
    console.error(new Error("This is an error"));
  }, 1000);
}, 30 * 1000);

process.on("exit", () => {
  console.log("Exiting...");
  app.close();
});
