import type { Message } from "stoat.js";
import { env } from "./env";
import logger from "./logger";
import type { Command } from "./types";

export async function getAndExecuteCommand(
  message: Message,
  commands: Map<string, Omit<Command, "execute"> & { execute: string }>,
) {
  logger.group.debug(`Handling message ${message.id}`);
  if (message.author?.bot) {
    if (!message.author.username) {
      logger.warn("Ignoring message from bot");
      logger.groupEnd.debug();
      return;
    }

    logger.warn(`Ignoring message from bot ${message.author.username}`);
    logger.groupEnd.debug();
    return;
  }

  if (message.content.startsWith(env.PREFIX)) {
    const args = message.content.slice(env.PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift();
    logger
      .label("Command")
      .log(`Received command: ${commandName}, args:`, args);
    const command = commands.get(commandName as string);
    if (command) {
      logger.label("Command").log(`Found command: ${commandName}`);
      const cmdStartTime = Date.now();
      try {
        // Extract function body from stringified arrow function
        const executeStr = command.execute as string;
        logger
          .label("Command")
          .log(`Execute string: ${executeStr.substring(0, 100)}...`);

        // Check if function is async
        const isAsync = executeStr.includes("async");
        logger.label("Command").log(`Is async: ${isAsync}`);

        const bodyMatch = executeStr.match(/\{([\s\S]*)\}$/);
        const body = bodyMatch?.[1] ?? executeStr;
        logger
          .label("Command")
          .log(`Extracted body: ${body.substring(0, 100)}...`);

        // Build scope with imports
        // biome-ignore lint/suspicious/noExplicitAny: it will be using any for a while
        const commandWithImports = command as any;
        const imports = commandWithImports.imports || {};
        const importParams = Object.keys(imports);
        logger.label("Command").log(`Imports available:`, importParams);

        // Reconstruct imported functions and objects
        const importedValues = importParams.map((param) => {
          const importStr = imports[param];
          // Try to parse as JSON first (for objects), then try as function
          try {
            return JSON.parse(importStr);
          } catch {
            try {
              return new Function(`return ${importStr}`)();
            } catch {
              return undefined;
            }
          }
        });

        logger.label("Command").log(`Executing command: ${commandName}`);
        const funcCode = isAsync
          ? `async (message, args, logger, ${importParams.join(", ")}) => { ${body} }`
          : `(message, args, logger, ${importParams.join(", ")}) => { ${body} }`;
        logger
          .label("Command")
          .log(`(Minified) Function code: ${funcCode.substring(0, 150)}...`);
        const executeFunction = new Function(`return ${funcCode}`)();
        await executeFunction(message, args, logger, ...importedValues);
        const cmdTime = Date.now() - cmdStartTime;
        logger
          .label("Command")
          .success(
            `Command executed successfully: ${commandName} (${cmdTime}ms)`,
          );
      } catch (error) {
        const cmdTime = Date.now() - cmdStartTime;
        logger
          .label("Command")
          .error(
            `Error executing command ${commandName} (${cmdTime}ms):`,
            error,
          );
        message.reply(`Error executing command: ${error}`);
      }
    } else {
      logger.label("Command").log(`Command not found: ${commandName}`);
      logger
        .label("Command")
        .log(`Available commands:`, Array.from(commands.keys()));
      message.reply("Unknown command");
    }
  }
  logger.groupEnd.debug();
}
