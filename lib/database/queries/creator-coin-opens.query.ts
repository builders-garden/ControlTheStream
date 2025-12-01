import { db } from "@/lib/database";
import {
  creatorCoinOpensTable,
  type CreateCreatorCoinOpen,
} from "@/lib/database/db.schema";

/**
 * Create a new creator coin open
 * @param data - The creator coin open data to create
 * @returns The created creator coin open
 */
export const createCreatorCoinOpen = async (data: CreateCreatorCoinOpen) => {
  const [newCreatorCoinOpen] = await db
    .insert(creatorCoinOpensTable)
    .values(data)
    .returning();
  return newCreatorCoinOpen;
};
