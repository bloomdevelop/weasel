import type { Message } from "stoat.js";

/**
 * Adds a reaction emoji to a message.
 * @param message - The message to react to
 * @param emoji - The emoji to add as a reaction (string or numeric code)
 * @returns The result of adding the reaction to the message
 */
export function react(message: Message, emoji: string | undefined) {
  if (!emoji) {
    throw new Error("The emoji is undefined!");
  }

  return message.react(encodeURIComponent(emoji));
}

export function unreact(message: Message, emoji: string | undefined) {
  if (!emoji) {
    throw new Error("The emoji is undefined!");
  }

  return message.unreact(encodeURIComponent(emoji));
}
