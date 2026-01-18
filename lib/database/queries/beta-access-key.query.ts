import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { BetaAccessKey, betaAccessKeysTable } from "../db.schema";

/**
 * Get a beta access key
 * @param key - The beta access key
 * @returns The beta access key
 */
export const getBetaAccessKey = async (
  key: string,
): Promise<BetaAccessKey | null> => {
  // Normalize key by removing all whitespace (including newlines)
  const normalizedKey = key.replace(/\s+/g, "");
  const [betaAccessKey] = await db
    .select()
    .from(betaAccessKeysTable)
    .where(
      eq(
        sql`REPLACE(REPLACE(REPLACE(${betaAccessKeysTable.key}, CHAR(10), ''), CHAR(13), ''), ' ', '')`,
        normalizedKey,
      ),
    )
    .limit(1);
  return betaAccessKey || null;
};

/**
 * Set a beta access key as used
 * @param key - The beta access key
 * @returns The beta access key
 */
export const setBetaAccessKeyUsed = async (
  key: string,
): Promise<BetaAccessKey | null> => {
  // Normalize key by removing all whitespace (including newlines)
  const normalizedKey = key.replace(/\s+/g, "");
  const [betaAccessKey] = await db
    .update(betaAccessKeysTable)
    .set({ used: true })
    .where(
      eq(
        sql`REPLACE(REPLACE(REPLACE(${betaAccessKeysTable.key}, CHAR(10), ''), CHAR(13), ''), ' ', '')`,
        normalizedKey,
      ),
    )
    .returning();
  return betaAccessKey || null;
};
