import { config } from "dotenv";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { brandsTable } from "../lib/database/db.schema";

// Load env vars from .env.local
config({ path: ".env.local" });

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_DATABASE_TOKEN = process.env.TURSO_DATABASE_TOKEN!;

async function resetPyro() {
  const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_DATABASE_TOKEN,
  });

  const db = drizzle(client);

  const result = await db
    .update(brandsTable)
    .set({
      pyroMint: null,
      pyroEmail: null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(brandsTable.slug, "the_rollup"))
    .returning();

  console.log("Reset pyro fields for brand:", result);
  process.exit(0);
}

resetPyro().catch(console.error);
