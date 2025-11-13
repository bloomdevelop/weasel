import type { Command } from "../../types";

export const about: Command = {
  name: "about",
  description: "Displays information about the bot.",
  async execute(message) {
    await message.channel?.sendMessage({
      embeds: [
        {
          title: "About",
          description:
            "Performance oriented bot for Stoat, written with just TypeScript and Bun. Possibly replacing Silk due how bad the codebase was it in the current state.",
          colour: "#0099ff",
        },
      ],
    });
  },
};
