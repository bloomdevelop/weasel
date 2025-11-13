import { readdir } from "node:fs/promises";
import logger from "./logger";
import type { Command } from "./types";

declare var self: Worker;

function isCommand(value: unknown): value is Command {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "description" in value &&
    "execute" in value &&
    typeof (value as Record<string, unknown>).execute === "function"
  );
}

function serializeCommandWithImports(
  command: Command,
  imports: Record<string, string>,
): Omit<Command, "execute"> & {
  execute: string;
  imports: Record<string, string>;
} {
  const executeStr = command.execute.toString();
  const minified = minifyFunction(executeStr);
  return {
    name: command.name,
    description: command.description,
    execute: minified,
    imports,
  };
}

function minifyFunction(funcStr: string): string {
  const NEWLINE_PLACEHOLDER = "___NEWLINE___";
  return funcStr
    .replace(/\n/g, NEWLINE_PLACEHOLDER) // Preserve actual newlines in source
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
    .replace(/\/\/.*$/gm, "") // Remove line comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/\s*([(){}[\];,:])\s*/g, "$1") // Remove spaces around brackets and punctuation
    .replace(new RegExp(NEWLINE_PLACEHOLDER, "g"), "\n") // Restore newlines
    .trim();
}

function extractExportsAsImports(
  module: Record<string, unknown>,
): Record<string, string> {
  const imports: Record<string, string> = {};
  for (const [key, value] of Object.entries(module)) {
    if (key !== "default" && typeof value === "function") {
      imports[key] = value.toString();
    } else if (
      key !== "default" &&
      value !== null &&
      typeof value === "object"
    ) {
      imports[key] = JSON.stringify(value);
    }
  }
  return imports;
}

self.onmessage = async (ev: MessageEvent) => {
  const { command, commandDir } = ev.data;
  logger.group.debug("Loading commands...");
  if (command === "loadCommands") {
    const startTime = performance.now();
    try {
      logger.label("Worker").debug(`Loading commands from: ${commandDir}`);
      const fileStart = performance.now();
      const commandFiles = await readdir(commandDir, { recursive: true });
      const fileTime = performance.now() - fileStart;
      logger
        .label("Worker")
        .debug(
          `Found ${commandFiles.length} files/folders in ${fileTime.toFixed(2)}ms:`,
          commandFiles,
        );
      const commands: Record<
        string,
        Omit<Command, "execute"> & { execute: string }
      > = {};

      for (const file of commandFiles) {
        if (!file.endsWith(".ts")) continue;

        const fileStartTime = performance.now();
        logger.label("Worker").debug(`Processing file: ${file}`);
        const filePath = new URL(
          file,
          new URL(`${commandDir}/`, import.meta.url),
        ).href;
        logger.label("Worker").debug(`File path: ${filePath}`);
        const module = await import(filePath);
        const importTime = performance.now() - fileStartTime;

        // Check for default export
        if (module.default && isCommand(module.default)) {
          logger
            .label("Worker")
            .debug(
              `Found default command: ${module.default.name} (${importTime.toFixed(2)}ms)`,
            );
          const imports = extractExportsAsImports(module);
          commands[module.default.name] = serializeCommandWithImports(
            module.default,
            imports,
          );
        } else {
          // Get all named exports
          for (const [key, value] of Object.entries(module)) {
            if (key !== "default" && isCommand(value)) {
              logger
                .label("Worker")
                .debug(
                  `Found named command: ${(value as Command).name} (${importTime.toFixed(2)}ms)`,
                );
              const imports = extractExportsAsImports(module);
              commands[(value as Command).name] = serializeCommandWithImports(
                value as Command,
                imports,
              );
            }
          }
        }
      }

      const totalTime = performance.now() - startTime;
      logger
        .label("Worker")
        .success(
          `Loaded ${Object.keys(commands).length} commands total in ${totalTime.toFixed(2)}ms:`,
          Object.keys(commands),
        );
      self.postMessage({ success: true, commands: JSON.stringify(commands) });
    } catch (error) {
      const totalTime = performance.now() - startTime;
      logger
        .label("Worker")
        .error(`Error loading commands (${totalTime.toFixed(2)}ms):`, error);
      self.postMessage({ success: false, error: String(error) });
    }
  }
};
