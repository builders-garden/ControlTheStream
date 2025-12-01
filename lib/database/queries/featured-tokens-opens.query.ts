import { db } from "@/lib/database";
import {
  featuredTokensOpensTable,
  type CreateFeaturedTokenOpen,
} from "@/lib/database/db.schema";

/**
 * Create a new featured token open
 * @param data - The featured token open data to create
 * @returns The created featured token open
 */
export const createFeaturedTokenOpen = async (
  data: CreateFeaturedTokenOpen,
) => {
  const [newFeaturedTokenOpen] = await db
    .insert(featuredTokensOpensTable)
    .values(data)
    .returning();
  return newFeaturedTokenOpen;
};
