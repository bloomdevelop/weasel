import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    STOAT_BOT_TOKEN: z.string().min(1).nonoptional(),
    PREFIX: z.string().min(1).default("/"),
    DB_FILE_NAME: z.string().min(1).nonoptional(),
  },
  runtimeEnv: process.env,
});
