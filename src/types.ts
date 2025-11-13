import type { Message } from "stoat.js";

type Command = {
    name: string;
    description: string;
    execute: (message: Message, args: string[]) => Promise<void>;
}

export type { Command }
