import {
  maxOptionsReachedEmbed,
  missingQuestionEmbed,
  notEnoughOptionsEmbed,
} from "../../embeds";
import { EmbedBuilder } from "../../helpers/embed-builder";
import { formatPollOptions } from "../../helpers/format-poll-options";
import { react } from "../../helpers/react-message";
import logger from "../../logger";
import type { Command } from "../../types";

const OPTIONS_EMOJIS: Array<string> = [
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
];

export const poll: Command = {
  name: "poll",
  description: "Creates a poll with options (up to 10)",
  async execute(message, args) {
    const input = args
      .join(" ")
      .split("|")
      .map((item) => item.trim());

    if (input.length < 3) {
      await message.reply({
        embeds: [notEnoughOptionsEmbed],
      });
      return;
    }

    const question = input[0];
    const options = input.slice(1);

    if (!question) {
      message.reply({
        embeds: [missingQuestionEmbed],
      });
      return;
    }

    if (options.length > 10) {
      await message.reply({
        embeds: [maxOptionsReachedEmbed],
      });
      return;
    }

    try {
      const pollEmbed = new EmbedBuilder()
        .setTitle(question)
        .setDescription(formatPollOptions(options, OPTIONS_EMOJIS))
        .build();
      const pollMessage = await message
        .reply({
          embeds: [pollEmbed],
        })
        ?.catch((error) => {
          if (error instanceof Error) {
            logger.label("Command >> Poll").error(error.message);
          }
        });

      if (!pollMessage) {
        logger
          .label("Command >> Poll")
          .error("Failed to create a poll message");
        return;
      }

      try {
        for (let i = 0; i < options.length; i++) {
          try {
            await react(pollMessage, OPTIONS_EMOJIS[i]);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            if (error instanceof Error) {
              logger
                .label("Command >> Poll")
                .error(`Unable to add reaction: ${error.message}`);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          logger
            .label("Command >> Poll")
            .warn("Poll was created but it's missing some reaction...");
          logger.label("Command >> Poll").error(error.message);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorEmbed = new EmbedBuilder()
          .setTitle("Error")
          .setDescription(
            `Something went wrong. Error Message: \n${error.message}`,
          )
          .setColour("#ff3900")
          .build();

        message.reply({ embeds: [errorEmbed] });
      }
    }
  },
};
