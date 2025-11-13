import type { Message } from "stoat.js";
import type { Command } from "../../types";

export const ping: Command = {
  name: "ping",
  description: "Ping the bot to check if it's online.",
  execute: async (message: Message) => {
    await message.reply("Pong!");
  },
};
