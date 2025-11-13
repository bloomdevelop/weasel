import { Client } from "stoat.js";
import { env } from "./env";
import { getAndExecuteCommand } from "./helpers";
import logger from "./logger";
import type { Command } from "./types";

const client = new Client();
const commands = new Map<
  string,
  Omit<Command, "execute"> & { execute: string }
>();

(async () => {
  const worker = new Worker(
    new URL("./commandLoaderWorker.ts", import.meta.url),
  );
  const startTime = Date.now();

  worker.onmessage = (ev: MessageEvent) => {
    const workerTime = Date.now() - startTime;
    const { success, commands: loadedCommands, error } = ev.data;

    if (success) {
      const parseStart = Date.now();
      const loadedCommandsObj = JSON.parse(loadedCommands);
      const parseTime = Date.now() - parseStart;

      for (const [name, cmd] of Object.entries(loadedCommandsObj)) {
        commands.set(
          name,
          cmd as Omit<Command, "execute"> & { execute: string },
        );
      }
      logger.success(
        `Loaded ${commands.size} commands in ${workerTime}ms (parsing: ${parseTime}ms)`,
      );
    } else {
      logger.error("Failed to load commands:", error);
    }

    worker.terminate();
  };

  worker.postMessage({
    command: "loadCommands",
    commandDir: `${import.meta.dir}/commands`,
  });
  logger.groupEnd.debug();
})();

client.on("messageCreate", async (message) => {
  return getAndExecuteCommand(message, commands);
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

client
  .loginBot(env.STOAT_BOT_TOKEN)
  .then(() => {
    logger.label("Client").success(`Logged in`);
  })
  .catch((error) => {
    logger.label("Client").error(`Failed to log in: ${error.message}`);
  });
