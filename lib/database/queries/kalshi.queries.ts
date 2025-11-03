import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/database";
import {
  kalshiEventsTable,
  type CreateKalshiEvent,
  type KalshiEvent,
} from "@/lib/database/db.schema";

/**
 * Create a new Kalshi event
 */
export const createKalshiEvent = async (
  eventData: CreateKalshiEvent,
): Promise<KalshiEvent> => {
  const [event] = await db
    .insert(kalshiEventsTable)
    .values(eventData)
    .returning();

  return event;
};

/**
 * Get a Kalshi event by brand ID and Kalshi event ID
 */
export const getKalshiEventByBrandAndEventId = async (
  brandId: string,
  kalshiEventId: string,
): Promise<KalshiEvent | null> => {
  const [event] = await db
    .select()
    .from(kalshiEventsTable)
    .where(
      and(
        eq(kalshiEventsTable.brandId, brandId),
        eq(kalshiEventsTable.kalshiEventId, kalshiEventId),
      ),
    )
    .limit(1);

  return event || null;
};

/**
 * Get a Kalshi event by event ID
 */
export const getKalshiEventById = async (
  eventId: string,
): Promise<KalshiEvent | null> => {
  const [event] = await db
    .select()
    .from(kalshiEventsTable)
    .where(eq(kalshiEventsTable.id, eventId))
    .limit(1);

  return event || null;
};

/**
 * Get all Kalshi events for a brand
 */
export const getKalshiEventsByBrand = async (
  brandId: string,
): Promise<KalshiEvent[]> => {
  return await db
    .select()
    .from(kalshiEventsTable)
    .where(eq(kalshiEventsTable.brandId, brandId))
    .orderBy(desc(kalshiEventsTable.createdAt));
};

/**
 * Get active Kalshi events for a brand
 */
export const getActiveKalshiEventsByBrand = async (
  brandId: string,
): Promise<KalshiEvent[]> => {
  return await db
    .select()
    .from(kalshiEventsTable)
    .where(
      and(
        eq(kalshiEventsTable.brandId, brandId),
        eq(kalshiEventsTable.status, "active"),
      ),
    )
    .orderBy(desc(kalshiEventsTable.createdAt));
};

/**
 * Update a Kalshi event
 */
export const updateKalshiEvent = async (
  eventId: string,
  updateData: Partial<CreateKalshiEvent>,
): Promise<KalshiEvent | null> => {
  const [updatedEvent] = await db
    .update(kalshiEventsTable)
    .set({
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(kalshiEventsTable.id, eventId))
    .returning();

  return updatedEvent || null;
};

/**
 * Delete a Kalshi event
 */
export const deleteKalshiEvent = async (eventId: string): Promise<boolean> => {
  try {
    await db.delete(kalshiEventsTable).where(eq(kalshiEventsTable.id, eventId));

    return true;
  } catch (error) {
    console.error("Error deleting Kalshi event:", error);
    return false;
  }
};

/**
 * Check if a Kalshi event already exists for a brand
 */
export const kalshiEventExists = async (
  brandId: string,
  kalshiEventId: string,
): Promise<boolean> => {
  const [event] = await db
    .select({ id: kalshiEventsTable.id })
    .from(kalshiEventsTable)
    .where(
      and(
        eq(kalshiEventsTable.brandId, brandId),
        eq(kalshiEventsTable.kalshiEventId, kalshiEventId),
      ),
    )
    .limit(1);

  return !!event;
};

/**
 * Activate a Kalshi event
 */
export const activateKalshiEvent = async (
  eventId: string,
): Promise<KalshiEvent | null> => {
  const [updatedEvent] = await db
    .update(kalshiEventsTable)
    .set({
      status: "active",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(kalshiEventsTable.id, eventId))
    .returning();

  return updatedEvent || null;
};

/**
 * Deactivate a Kalshi event
 */
export const deactivateKalshiEvent = async (
  eventId: string,
): Promise<KalshiEvent | null> => {
  const [updatedEvent] = await db
    .update(kalshiEventsTable)
    .set({
      status: "inactive",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(kalshiEventsTable.id, eventId))
    .returning();

  return updatedEvent || null;
};
