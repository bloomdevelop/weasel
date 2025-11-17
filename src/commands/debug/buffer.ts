import type { Message } from "stoat.js";
import { commands } from "../..";
import { formatSize } from "../../helpers/size-formatter";
import type { Command } from "../../types";

export const bufferCommand: Command = {
  name: "buffer",
  description: "Debug buffer of an command (which is using BufferMap)",
  execute: async (message: Message) => {
    const hexBuffer = commands.getRawBufferHex();
    const bufferSizeBytes = hexBuffer.length / 2;
    const formattedSize = formatSize(bufferSizeBytes);

    await message.channel?.sendMessage(
      `Buffer (${formattedSize}): \n\`\`\`\n${hexBuffer}\n\`\`\``,
    );
  },
};
