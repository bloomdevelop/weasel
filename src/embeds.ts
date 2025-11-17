import { EmbedBuilder } from "./helpers/embed-builder";

const commandNotFoundEmbed = new EmbedBuilder()
  .setTitle("Error")
  .setDescription("Command not found...")
  .setColour("#ff3900")
  .build();

const notEnoughOptionsEmbed = new EmbedBuilder()
  .setTitle("Not Enough Options")
  .setDescription("You must provide at least 2 options.")
  .setColour("#ff3900")
  .build();

const maxOptionsReachedEmbed = new EmbedBuilder()
  .setTitle("Max options reached")
  .setDescription("The maximum number of options is 10.")
  .setColour("#ff3900")
  .build();

const missingQuestionEmbed = new EmbedBuilder()
  .setTitle("Missing Question")
  .setDescription("Please at least provide an question.")
  .setColour("#ff3900")
  .build();

export {
  commandNotFoundEmbed,
  notEnoughOptionsEmbed,
  maxOptionsReachedEmbed,
  missingQuestionEmbed,
};
