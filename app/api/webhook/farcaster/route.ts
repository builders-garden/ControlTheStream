import {
  MiniAppNotificationDetails,
  ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node";
import { NextRequest } from "next/server";
import { FARCASTER_CLIENT_FID } from "@/lib/constants";
import {
  deleteUserBaseNotificationDetails,
  deleteUserFarcasterNotificationDetails,
  getOrCreateUserFromFid,
  setUserBaseNotificationDetails,
  setUserFarcasterNotificationDetails,
} from "@/lib/database/queries";
import { sendNotification } from "@/lib/utils/notifications";

/**
 * A function to delete the notification details for a user given the Farcaster FID and the app FID
 * @param fid - The Farcaster FID of the user
 * @param appFid - The app FID of the user
 * @returns void
 */
const deleteNotificationDetails = async (fid: number, appFid: number) => {
  if (appFid === FARCASTER_CLIENT_FID.farcaster) {
    await deleteUserFarcasterNotificationDetails(fid);
  } else if (appFid === FARCASTER_CLIENT_FID.base) {
    await deleteUserBaseNotificationDetails(fid);
  } else {
    console.error(`[webhook/farcaster] Invalid app FID: ${appFid}`);
  }
};

/**
 * A function to set the notification details for a user given the Farcaster FID and the app FID and the notification details
 * @param fid - The Farcaster FID of the user
 * @param appFid - The app FID of the user
 * @param notificationDetails - The notification details to set
 * @returns void
 */
const setNotificationDetails = async (
  fid: number,
  appFid: number,
  notificationDetails: MiniAppNotificationDetails,
) => {
  if (appFid === FARCASTER_CLIENT_FID.farcaster) {
    await setUserFarcasterNotificationDetails(fid, notificationDetails);
  } else if (appFid === FARCASTER_CLIENT_FID.base) {
    await setUserBaseNotificationDetails(fid, notificationDetails);
  } else {
    console.error(`[webhook/farcaster] Invalid app FID: ${appFid}`);
  }
};

export async function POST(request: NextRequest) {
  const requestJson = await request.json();
  console.log("[webhook/farcaster] requestJson", requestJson);

  let data;
  try {
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType;

    switch (error.name) {
      case "VerifyJsonFarcasterSignature.InvalidDataError":
      case "VerifyJsonFarcasterSignature.InvalidEventDataError":
        // The request data is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 400 },
        );
      case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
        // The app key is invalid
        return Response.json(
          { success: false, error: error.message },
          { status: 401 },
        );
      case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
        // Internal error verifying the app key (caller may want to try again)
        return Response.json(
          { success: false, error: error.message },
          { status: 500 },
        );
    }
  }

  console.log("[webhook/farcaster] parsed event data", data);
  const fid = data.fid;
  const appFid = data.appFid;
  const event = data.event;
  await getOrCreateUserFromFid(fid);

  // Whether the client is Farcaster or Base
  const isFarcasterClient = appFid === FARCASTER_CLIENT_FID.farcaster;
  const isBaseClient = appFid === FARCASTER_CLIENT_FID.base;

  // The webhook identifier type
  const webhookIdentifier = isFarcasterClient
    ? "farcaster"
    : isBaseClient
      ? "base"
      : "unknown";

  switch (event.event) {
    case "miniapp_added":
      if (event.notificationDetails) {
        console.log(`[webhook/${webhookIdentifier}] miniapp_added`, event);
        await setNotificationDetails(fid, appFid, event.notificationDetails);
        // Defer notification sending to after response is returned
        setImmediate(async () => {
          await sendNotification({
            fid,
            title: `Welcome to Control the Stream!`,
            body: `Enjoy your favourite streams and interact with them in real time!`,
            notificationDetails: event.notificationDetails,
          });
        });
      } else {
        await deleteNotificationDetails(fid, appFid);
      }

      break;
    case "miniapp_removed": {
      console.log(`[webhook/${webhookIdentifier}] miniapp_removed`, event);
      await deleteNotificationDetails(fid, appFid);

      break;
    }
    case "notifications_enabled": {
      console.log(
        `[webhook/${webhookIdentifier}] notifications_enabled`,
        event,
      );
      await setNotificationDetails(fid, appFid, event.notificationDetails);

      // Defer notification sending to after response is returned
      setImmediate(async () => {
        await sendNotification({
          fid,
          title: `Ding ding dong`,
          body: `Thank you for enabling notifications for Control the Stream!`,
          notificationDetails: event.notificationDetails,
        });
      });
      break;
    }
    case "notifications_disabled": {
      console.log(
        `[webhook/${webhookIdentifier}] notifications_disabled`,
        event,
      );
      await deleteNotificationDetails(fid, appFid);

      break;
    }
  }

  return Response.json({ success: true });
}
