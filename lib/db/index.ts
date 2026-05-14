import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!dbInstance) {
    try {
      client = postgres(url, { max: 5 });
      dbInstance = drizzle(client, { schema });
    } catch (e) {
      console.error("[db] init", e);
      client = null;
      dbInstance = null;
      return null;
    }
  }
  return dbInstance;
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
export * from "./schema";
