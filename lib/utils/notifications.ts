import {
  MiniAppNotificationDetails,
  sendNotificationResponseSchema,
  type SendNotificationRequest,
} from "@farcaster/miniapp-sdk";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/lib/zod";
import { User } from "../database/db.schema";
import { SendFarcasterNotificationResult } from "../types/farcaster.type";

/**
 * Send a notification to a user, either a Farcaster user or a Base user depending on the notification details.
 * @param fid - The Farcaster user ID
 * @param title - The title of the notification
 * @param body - The body of the notification
 * @param targetUrl - The URL to redirect to when the notification is clicked (optional)
 * @param notificationDetails - The notification details of the user (required)
 * @returns The result of the notification
 */
export async function sendNotification({
  fid,
  title,
  body,
  targetUrl,
  notificationDetails,
}: {
  fid: number;
  title: string;
  body: string;
  targetUrl?: string;
  notificationDetails?: MiniAppNotificationDetails | null;
}): Promise<SendFarcasterNotificationResult> {
  if (!notificationDetails) return { state: "no_token" };

  const url = notificationDetails.url;
  const tokens = [notificationDetails.token];

  const requestBody = {
    notificationId: uuidv4(),
    title,
    body,
    targetUrl: targetUrl ?? env.NEXT_PUBLIC_URL,
    tokens,
  } satisfies SendNotificationRequest;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseJson = await response.json();

  if (response.status === 200) {
    console.log("[sendNotification] responseJson", responseJson);
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
    if (!responseBody.success) {
      console.error(
        `Error sending notification to ${fid}: malformed response`,
        responseBody.error.errors,
      );
      return { state: "error", error: responseBody.error.errors };
    }

    if (responseBody.data.result.invalidTokens.length > 0) {
      console.error(
        `Error sending notification to ${fid}: invalid tokens`,
        responseBody.data.result.invalidTokens,
      );
      return {
        state: "invalid_token",
        invalidTokens: responseBody.data.result.invalidTokens,
      };
    }

    if (responseBody.data.result.rateLimitedTokens.length > 0) {
      console.error(
        `Error sending notification to ${fid}: rate limited`,
        responseBody.data.result.rateLimitedTokens,
      );
      return {
        state: "rate_limit",
        rateLimitedTokens: responseBody.data.result.rateLimitedTokens,
      };
    }

    return { state: "success" };
  }

  console.error(
    `Error sending notification to ${fid}. Status: ${response.status} with error: ${JSON.stringify(responseJson, null, 2)}`,
  );
  return { state: "error", error: responseJson };
}

/**
 * Send a notification to a list of users on the Farcaster client or Base client depending on the notification details.
 * @param title - The title of the notification
 * @param body - The body of the notification
 * @param targetUrl - The URL to redirect to when the notification is clicked (optional)
 * @param users - The users to send the notification to
 * @returns The result of the notification sent to the users
 */
export async function sendNotificationToUsers({
  title,
  body,
  targetUrl,
  users,
  notificationId,
}: {
  title: string;
  body: string;
  targetUrl?: string;
  users: {
    fid: number;
    notificationDetails: MiniAppNotificationDetails;
  }[];
  notificationId?: string;
}) {
  if (!users)
    return {
      message: "No users found",
      successfulTokens: [],
      invalidTokens: [],
      rateLimitedTokens: [],
      errorFids: [],
    };

  // Prepare the arrays to store the results
  const successfulTokens: string[] = [];
  const invalidTokens: string[] = [];
  const rateLimitedTokens: string[] = [];
  const errorFids: number[] = [];

  // Creates chunks of 100 users
  const chunkedUsers = [];
  for (let i = 0; i < users.length; i += 100) {
    chunkedUsers.push(users.slice(i, i + 100));
  }

  // For each chunk, send the notification
  for (const chunk of chunkedUsers) {
    const requestBody = {
      notificationId: notificationId ?? uuidv4(), // Fallback to a random UUID if no notification ID is provided
      title,
      body,
      targetUrl: targetUrl ?? env.NEXT_PUBLIC_URL,
      tokens: chunk.map((user) => user.notificationDetails.token),
    } satisfies SendNotificationRequest;

    // Get the first user's notification details url because it's the same for all users in the chunk
    const fetchUrl = chunk[0].notificationDetails.url;

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      const responseJson = await response.json();
      console.log("[sendNotificationToUsers] responseJson", responseJson);
      const responseBody =
        sendNotificationResponseSchema.safeParse(responseJson);
      if (!responseBody.success) {
        console.error(
          `Error sending notification to chunk: malformed response`,
          responseBody.error.errors,
        );
        errorFids.push(...chunk.map((user) => user.fid));
        continue;
      }

      if (responseBody.data.result.invalidTokens.length > 0) {
        console.error(
          `Error sending notification to chunk: invalid tokens`,
          responseBody.data.result.invalidTokens,
        );
        invalidTokens.push(...responseBody.data.result.invalidTokens);
      }

      if (responseBody.data.result.rateLimitedTokens.length > 0) {
        console.error(
          `Error sending notification to chunk: rate limited`,
          responseBody.data.result.rateLimitedTokens,
        );
        rateLimitedTokens.push(...responseBody.data.result.rateLimitedTokens);
      }

      successfulTokens.push(...responseBody.data.result.successfulTokens);
    } else {
      console.error("[sendNotificationToUsers] error", await response.json());
      errorFids.push(...chunk.map((user) => user.fid));
    }
  }

  // Return the results
  return {
    message: "Sent notifications to all users",
    successfulTokens,
    invalidTokens,
    rateLimitedTokens,
    errorFids,
  };
}

/**
 * Utility function to filter and map the users to the correct format for both Farcaster and Base platforms.
 * @param users - The users to get the notification details for
 * @returns The formatted users for both Farcaster and Base platforms
 */
export const getAllPlatformsFormattedUsers = async (users: User[]) => {
  const farcasterUsers = users
    .filter(
      (user) => !!user.farcasterFid && !!user.farcasterNotificationDetails,
    )
    .map((user) => ({
      fid: user.farcasterFid!,
      notificationDetails: user.farcasterNotificationDetails!,
    }));

  const baseUsers = users
    .filter((user) => !!user.farcasterFid && !!user.baseNotificationDetails)
    .map((user) => ({
      fid: user.farcasterFid!,
      notificationDetails: user.baseNotificationDetails!,
    }));

  return {
    farcasterUsers,
    baseUsers,
  };
};
