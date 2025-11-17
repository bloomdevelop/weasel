import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

type Config = {
  disabled_commands: Array<string>;
};

export const configTable = sqliteTable("config_table", {
  id: text()
    .primaryKey()
    .$defaultFn(() => ulid()),
  server_id: text("server_id").notNull(),
  config: text({ mode: "json" }).notNull().$type<Config>(),
});
