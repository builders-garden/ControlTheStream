import { and, desc, eq } from "drizzle-orm";
import { Address } from "viem";
import { db } from "@/lib/database";
import {
  creatorCoinTable,
  type CreateCreatorCoin,
  type CreatorCoin,
} from "@/lib/database/db.schema";

/**
 * Create a new Creator Coin
 */
export const createCreatorCoin = async (
  coinData: CreateCreatorCoin,
): Promise<CreatorCoin> => {
  const [coin] = await db.insert(creatorCoinTable).values(coinData).returning();

  return coin;
};

/**
 * Get a Creator Coin by ID
 */
export const getCreatorCoinById = async (
  coinId: string,
): Promise<CreatorCoin | null> => {
  const [coin] = await db
    .select()
    .from(creatorCoinTable)
    .where(eq(creatorCoinTable.id, coinId))
    .limit(1);

  return coin || null;
};

/**
 * Get all Creator Coins for a brand
 */
export const getCreatorCoinsByBrand = async (
  brandId: string,
): Promise<CreatorCoin[]> => {
  return await db
    .select()
    .from(creatorCoinTable)
    .where(eq(creatorCoinTable.brandId, brandId))
    .orderBy(desc(creatorCoinTable.createdAt));
};

/**
 * Get all Creator Coins
 */
export const getAllCreatorCoins = async (): Promise<CreatorCoin[]> => {
  return await db
    .select()
    .from(creatorCoinTable)
    .orderBy(desc(creatorCoinTable.createdAt));
};

/**
 * Get a Creator Coin by brand ID and address
 */
export const getCreatorCoinByBrandAndAddress = async (
  brandId: string,
  address: Address,
): Promise<CreatorCoin | null> => {
  const [coin] = await db
    .select()
    .from(creatorCoinTable)
    .where(
      and(
        eq(creatorCoinTable.brandId, brandId),
        eq(creatorCoinTable.address, address),
      ),
    )
    .limit(1);

  return coin || null;
};

/**
 * Update a Creator Coin
 */
export const updateCreatorCoin = async (
  coinId: string,
  updateData: Partial<CreateCreatorCoin>,
): Promise<CreatorCoin | null> => {
  const [updatedCoin] = await db
    .update(creatorCoinTable)
    .set({
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(creatorCoinTable.id, coinId))
    .returning();

  return updatedCoin || null;
};

/**
 * Delete a Creator Coin
 */
export const deleteCreatorCoin = async (coinId: string): Promise<boolean> => {
  try {
    await db.delete(creatorCoinTable).where(eq(creatorCoinTable.id, coinId));

    return true;
  } catch (error) {
    console.error("Error deleting Creator Coin:", error);
    return false;
  }
};

/**
 * Check if a Creator Coin already exists for a brand
 */
export const creatorCoinExists = async (
  brandId: string,
  address: Address,
): Promise<boolean> => {
  const [coin] = await db
    .select({ id: creatorCoinTable.id })
    .from(creatorCoinTable)
    .where(
      and(
        eq(creatorCoinTable.brandId, brandId),
        eq(creatorCoinTable.address, address),
      ),
    )
    .limit(1);

  return !!coin;
};
