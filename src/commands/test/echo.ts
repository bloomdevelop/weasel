import type { Command } from "../../types";

export const echo: Command = {
  name: "echo",
  description: "Repeats your message content",
  async execute(message, args) {
    try {
      if (!args.length) {
        message.reply("Please provide a message content...");
      }

      const content = args.join(" ");

      if (content.includes("@")) {
        message.reply("You can't mention everyone or anyone else.");
        return;
      }

      message.reply(content);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);

        message.reply(`An error occurred: ${error.message}`);
      }
    }
  },
};
