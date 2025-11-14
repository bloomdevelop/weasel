import { Client } from "stoat.js";
import { env } from "./env";
import logger from "./logger";
import type { Command } from "./types";

const client = new Client();

(async () => {
  client
    .loginBot(env.STOAT_BOT_TOKEN)
    .then(() => {
      logger.label("Client").success(`Logged in`);
    })
    .catch((error) => {
      logger.label("Client").error(`Failed to log in: ${error.message}`);
    });
})();

client.on("messageCreate", async (message) => {
  return;
});

// Small workaround since they didn't fix it unless manual patch
client.on("error", (error) => {
  if (error instanceof Error) {
    logger.label("Client").error(`Received error event: ${error.message}`);
  }
});

client.on("connected", () => {
  logger.label("Client").debug("Connected");
});
