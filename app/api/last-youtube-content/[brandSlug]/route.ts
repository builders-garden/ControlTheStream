import crypto from "crypto";
import ky, { HTTPError } from "ky";
import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
import {
  getAllSubscribedUsersToBrand,
  getBrandBySlug,
  updateBrand,
} from "@/lib/database/queries";
import { YoutubeContent } from "@/lib/types/youtube-content.type";
import {
  getAllPlatformsFormattedUsers,
  sendNotificationToUsers,
} from "@/lib/utils/notifications";
import { env } from "@/lib/zod";

const FOUR_MINUTES_MILLISECONDS = 1000 * 60 * 4;
const TWO_MINUTES_MILLISECONDS = 1000 * 60 * 2;

/**
 * Fetches YouTube content using the specified API key
 * @param channelId - YouTube channel ID
 * @param apiKey - YouTube API key to use
 * @returns YouTube content response
 * @throws HTTPError if the request fails
 */
async function fetchYoutubeContent(
  channelId: string,
  apiKey: string,
): Promise<YoutubeContent> {
  return await ky
    .get<YoutubeContent>("https://www.googleapis.com/youtube/v3/search", {
      searchParams: {
        channelId,
        type: "video",
        part: "snippet",
        key: apiKey,
        maxResults: 1,
        eventType: "live",
      },
    })
    .json();
}

/**
 * Checks if the error is a quota exceeded error from YouTube API
 * @param error - The error to check
 * @returns true if the error is a quota exceeded error
 */
async function isQuotaExceededError(error: unknown): Promise<boolean> {
  if (!(error instanceof HTTPError)) {
    return false;
  }

  // Check if status is 403
  if (error.response.status !== 403) {
    return false;
  }

  // Try to parse the error response to check for quotaExceeded reason
  try {
    const errorBody = await error.response.json();
    return (
      errorBody?.error?.errors?.some(
        (err: any) => err.reason === "quotaExceeded",
      ) ?? false
    );
  } catch {
    return false;
  }
}

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ brandSlug: string }> },
) => {
  try {
    const { brandSlug } = await params;

    if (!brandSlug) {
      return NextResponse.json(
        { success: false, error: "Brand slug is required" },
        { status: 400 },
      );
    }

    // Get the brand from the database
    const brand = await getBrandBySlug(brandSlug);

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 },
      );
    }

    // Get the channel id from the brand
    const channelId = brand.youtubeChannelId;

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: "Channel ID not found" },
        { status: 404 },
      );
    }

    // Check if the live url expiration is in the past
    const liveUrlExpiration = brand.liveUrlExpiration;
    const isLiveUrlExpired = !!liveUrlExpiration
      ? new Date(liveUrlExpiration) < new Date()
      : true;

    // If cached live URL still valid, just return it
    if (!isLiveUrlExpired && brand.youtubeLiveUrl) {
      // If the live url is found, return the live url from the database
      return NextResponse.json(
        {
          success: true,
          data: {
            url: brand.youtubeLiveUrl,
            title: brand.streamTitle,
            isLive: brand.isLive,
          },
        },
        { status: 200 },
      );
    }

    // Set variables for live state and new expiration date
    let isLive = false;
    let newExpirationDate = 0;

    try {
      // Try to fetch an active live event first with YOUTUBE_API_KEY1
      // If quota exceeded, fallback to YOUTUBE_API_KEY2
      let lastYoutubeContent: YoutubeContent;
      try {
        lastYoutubeContent = await fetchYoutubeContent(
          channelId,
          env.YOUTUBE_API_KEY1,
        );
      } catch (error) {
        // Check if it's a quota exceeded error
        if (await isQuotaExceededError(error)) {
          // Try with the second API key
          lastYoutubeContent = await fetchYoutubeContent(
            channelId,
            env.YOUTUBE_API_KEY2,
          );
        } else {
          // Re-throw if it's not a quota exceeded error
          throw error;
        }
      }

      let youtubeLiveUrl: string;
      let title: string;

      if (lastYoutubeContent.items && lastYoutubeContent.items.length > 0) {
        // Case 1: Live video found
        youtubeLiveUrl = `https://www.youtube.com/embed/${lastYoutubeContent.items[0].id.videoId}`;
        title = lastYoutubeContent.items[0].snippet.title;
        isLive = true;
        newExpirationDate = new Date(
          Date.now() + FOUR_MINUTES_MILLISECONDS,
        ).getTime(); // 4 minutes because the live won't probably end up soon
      } else {
        // Case 2: No live → fallback to RSS XML
        isLive = false;
        newExpirationDate = new Date(
          Date.now() + TWO_MINUTES_MILLISECONDS,
        ).getTime(); // 2 minutes because we want to check again more often

        // Fetch the RSS XML
        const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const xml = await ky.get(FEED_URL).text();
        const parsed = await parseStringPromise(xml);
        const entries = parsed.feed.entry ?? [];

        let chosenEntry: any;
        // Look for past videos first
        chosenEntry = entries.find((e: any) =>
          e.link?.[0]?.$.href.includes("/watch?v="),
        );

        // Then fallback to Shorts (/shorts/)
        if (!chosenEntry) {
          chosenEntry = entries.find((e: any) =>
            e.link?.[0]?.$.href.includes("/shorts/"),
          );
        }

        // If no video found, set the live url and title as default
        if (!chosenEntry) {
          youtubeLiveUrl = `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
          title = `${brand.name} Streaming`;
        } else {
          const videoId = chosenEntry["yt:videoId"][0];
          title = chosenEntry.title[0];
          youtubeLiveUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Save latest video/live in DB with title and expiration date
      await updateBrand(brandSlug, {
        youtubeLiveUrl,
        liveUrlExpiration: newExpirationDate,
        isLive,
        streamTitle: title,
      });

      // If the brand was not live and now is live, or if the live url is different from the previous one
      // send a notification to the users subscribed to the brand notifications
      if (
        (!brand.isLive && isLive) ||
        (brand.youtubeLiveUrl !== youtubeLiveUrl && isLive)
      ) {
        const subscribedUsers = await getAllSubscribedUsersToBrand(brand.id);
        const { farcasterUsers, baseUsers } =
          await getAllPlatformsFormattedUsers(subscribedUsers);

        const notificationInfo = {
          title: `${brand.name} is live! 📺`,
          body: `Click to watch the live stream now`,
          targetUrl: `${env.NEXT_PUBLIC_URL}/${brand.slug}`,
        };

        // Generate a notification id hashing the brand id, the stream title and the youtube live url
        // day (YYYY-MM-DD) and hour (HH) of the current date
        const formattedDate =
          new Date().toISOString().split("T")[0] + "-" + new Date().getHours();
        const notificationId = crypto
          .createHash("sha256")
          .update(`${brand.id}-${title}-${youtubeLiveUrl}-${formattedDate}`)
          .digest("hex");

        // Send the notification to the users on the Farcaster client
        await sendNotificationToUsers({
          ...notificationInfo,
          users: farcasterUsers,
          notificationId,
        });

        // Send the notification to the users on the Base client
        await sendNotificationToUsers({
          ...notificationInfo,
          users: baseUsers,
          notificationId,
        });
      }

      return NextResponse.json(
        { success: true, data: { url: youtubeLiveUrl, title } },
        { status: 200 },
      );
    } catch (error) {
      // If the google endpoint is not working, return the live url generated from the channel id
      return NextResponse.json(
        {
          success: true,
          data: {
            url: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
            title: `${brand.name} Streaming`,
          },
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Get youtube content error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch youtube content" },
      { status: 500 },
    );
  }
};
