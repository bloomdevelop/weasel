import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Message } from "stoat.js";
import { commandNotFoundEmbed } from "./embeds";
import { env } from "./env";
import type { BufferMap } from "./helpers/buffer-map";
import { formatSize } from "./helpers/size-formatter";
import logger from "./logger";
import type { Command } from "./types";

export async function loadCommands(
  map: BufferMap<string, Command>,
): Promise<void> {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const commandsDir = join(__dirname, "commands");
  const categories = await readdir(commandsDir);

  for (const category of categories) {
    const categoryPath = join(commandsDir, category);
    const files = await readdir(categoryPath);

    for (const file of files) {
      if (!file.endsWith(".ts")) continue;

      const filePath = join(categoryPath, file);
      try {
        const module = await import(`file://${filePath}`);
        const command =
          module.default ||
          Object.values(module).find(
            (exp) => exp && typeof exp === "object" && "name" in exp,
          );

        if (command) {
          logger
            .label("Commands >> Loader")
            .success(`Loaded command: ${command.name}`);
          map.set(command.name, command);
        }
      } catch (error) {
        logger
          .label("Commands >> Loader")
          .error(`Failed to load ${filePath}:`, error);
      }
    }
  }

  const hexBuffer = map.getRawBufferHex();
  const bufferSizeBytes = hexBuffer.length / 2;
  const formattedSize = formatSize(bufferSizeBytes);

  logger
    .label("Commands >> BufferMap")
    .debug(`Our BufferMap's Size after loading: ${formattedSize}`);
}

export function findAndExecuteCommand(
  map: BufferMap<string, Command>,
  message: Message,
): void {
  if (message.author?.bot) {
    logger.label("Commands").alert(`Ignoring bot message`);
    return;
  }

  if (message.content.startsWith(env.PREFIX)) {
    const args = message.content.slice(env.PREFIX.length).trim().split(/\s+/);
    const command_name = args.shift();

    logger.label("Commands").info(`Received command: ${command_name}`);

    const command = map.get(command_name as string);

    if (command) {
      const start_time = performance.now();

      try {
        command.execute(message, args);
      } catch (error) {
        logger
          .label("Commands")
          .error(`Failed to execute command: ${command.name}`, error);
      } finally {
        const end_time = performance.now();
        const duration = end_time - start_time;
        logger
          .label("Commands")
          .debug(`Command ${command.name} took ${duration}ms`);
      }
    } else {
      message.reply({
        embeds: [commandNotFoundEmbed],
      });
    }
  }
}
