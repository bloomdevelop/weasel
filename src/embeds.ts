import { EmbedBuilder } from "./helpers/embed-builder";

const commandNotFoundEmbed = new EmbedBuilder()
  .setTitle("Error")
  .setDescription("Command not found...")
  .setColour("#ff3900")
  .build();

export { commandNotFoundEmbed };
