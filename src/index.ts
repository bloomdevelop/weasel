import { Client } from "stoat.js";
import { findAndExecuteCommand, loadCommands } from "./commands";
import { env } from "./env";
import { BufferMap } from "./helpers/buffer-map";
import logger from "./logger";
import type { Command } from "./types";

const client = new Client();
export const commands = new BufferMap<string, Command>();

(async () => {
  client
    .loginBot(env.STOAT_BOT_TOKEN)
    .then(() => {
      logger.label("Client >> Bot").success(`Logged in`);
    })
    .catch((error) => {
      logger.label("Client >> Bot").error(`Failed to log in: ${error.message}`);
    });

  loadCommands(commands);
})();

client.on("messageCreate", async (message) => {
  findAndExecuteCommand(commands, message);
  return;
});

// Small workaround since they didn't fix it unless manual patch
// Check pull request #122 on Github (https://github.com/stoatchat/javascript-client-sdk/pull/122)
client.on("error", (error) => {
  if (error instanceof Error) {
    logger
      .label("Client >> Event")
      .error(`Received error event: ${error.message}`);
  }
});

client.on("connected", () => {
  logger.label("Client >> Event").info("Connected");
});
