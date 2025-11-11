import { clsx, type ClassValue } from "clsx";
import ky from "ky";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { BASE_APP_SUPPORTED_CHAINS } from "@/lib/constants";
import { FeaturedToken } from "../database/db.schema";
import { Token } from "../types/tokens.type";

/**
 * Merge class names
 * @param inputs - Class names to merge
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if an image is valid client-side
 * @param imageSrc - The source of the image
 * @returns True if the image is valid, false otherwise
 */
export const checkImage = async (imageSrc: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc ?? "";
    image.alt = "Participant Image";
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
  });
};

/**
 * Validate an image URL server-side
 * @param url - The URL of the image
 * @returns The URL if the image is valid, null otherwise
 */
export const validateImageUrl = async (url: string): Promise<string | null> => {
  try {
    await ky.head(url, { timeout: false });
    return url;
  } catch {
    return null;
  }
};

/**
 * Formats a number with 'k' for thousands and 'M' for millions
 * @param value - The number to format
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string with appropriate suffix
 *
 * Examples:
 * formatNumberWithSuffix(1234) => "1.23k"
 * formatNumberWithSuffix(1234567) => "1.23M"
 */
export const formatNumberWithSuffix = (value: number, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  // For values less than 1000, just return the number with fixed decimals
  if (Math.abs(value) < 1000) {
    return value.toFixed(decimals);
  }

  // For thousands (k)
  if (Math.abs(value) < 1000000) {
    return (value / 1000).toFixed(decimals) + "k";
  }

  // For millions (M)
  return (value / 1000000).toFixed(decimals) + "M";
};

/**
 * Format the avatar src for imagedelivery.net images to reasonable avatar sizes
 *
 * @docs https://developers.cloudflare.com/images/transform-images/transform-via-url/#options
 *
 * @param avatarSrc - The src of the avatar
 * @returns The formatted avatar src
 */
export const formatAvatarSrc = (avatarSrc: string) => {
  if (avatarSrc.startsWith("https://imagedelivery.net")) {
    const defaultAvatar = "/anim=false,fit=contain,f=auto,w=512";
    if (avatarSrc.endsWith("/rectcrop3")) {
      avatarSrc = avatarSrc.replace("/rectcrop3", defaultAvatar);
    } else if (avatarSrc.endsWith("/original")) {
      avatarSrc = avatarSrc.replace("/original", defaultAvatar);
    } else if (avatarSrc.endsWith("/public")) {
      avatarSrc = avatarSrc.replace("/public", defaultAvatar);
    }
  }
  return avatarSrc;
};

/**
 * Copy text to clipboard
 * @param text - The text to copy
 */
export const copyToClipboard = async (text: string | undefined) => {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);

    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy text");
    }

    document.body.removeChild(textArea);
  }
};

/**
 * Create a twitter intent url to open a prefilled tweet
 * @param text - The text of the tweet
 * @param miniappUrl - The url of the miniapp
 * @returns The twitter intent url
 */
export const createTwitterIntentUrl = (text: string, miniappUrl: string) => {
  const finalURL = `https://x.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(miniappUrl)}&via=builders_garden`;
  return finalURL;
};

/**
 * Format a wallet address to a more readable format
 * @param address - The wallet address
 * @returns The formatted wallet address
 */
export const formatWalletAddress = (address?: string | null) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
};

/**
 * Capitalize the first letter of a string
 * @param string - The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Get the name of a chain by its chainId
 * @param chainId - The chainId of the chain
 * @returns The name of the chain
 */
export const getChainName = (chainId: string) => {
  return BASE_APP_SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId)
    ?.name;
};

/**
 * Deep compare two tokens from the database
 * @param token1 - The first token
 * @param token2 - The second token
 * @returns True if the tokens are equal, false otherwise
 */
export const deepCompareDatabaseTokens = (
  token1: FeaturedToken,
  token2: FeaturedToken,
) => {
  return (
    token1.address === token2.address &&
    token1.chainId === token2.chainId &&
    token1.symbol === token2.symbol &&
    token1.name === token2.name &&
    token1.decimals === token2.decimals &&
    token1.logoUrl === token2.logoUrl &&
    token1.chainLogoUrl === token2.chainLogoUrl &&
    token1.description === token2.description &&
    token1.externalUrl === token2.externalUrl
  );
};

/**
 * Deep compare two tokens from Zerion
 * @param token1 - The first token
 * @param token2 - The second token
 * @returns True if the tokens are equal, false otherwise
 */
export const deepCompareZerionTokens = (token1: Token, token2: Token) => {
  return (
    token1.address === token2.address &&
    token1.chainId === token2.chainId &&
    token1.symbol === token2.symbol &&
    token1.name === token2.name &&
    token1.decimals === token2.decimals &&
    token1.iconUrl === token2.iconUrl
  );
};

/**
 * Deep compare two tokens from Zerion and the database
 * @param databaseToken - The database token
 * @param zerionToken - The zerion token
 * @returns True if the tokens are equal, false otherwise
 */
export const deepCompareDatabaseAndZerionTokens = (
  databaseToken: FeaturedToken,
  zerionToken: Token,
) => {
  return (
    databaseToken.address === zerionToken.address &&
    databaseToken.chainId === parseInt(zerionToken.chainId ?? "-1") &&
    databaseToken.symbol === zerionToken.symbol &&
    databaseToken.name === zerionToken.name &&
    databaseToken.decimals === zerionToken.decimals
  );
};

/**
 * Get the logo url of a chain by its chainId
 * @param chainId - The chainId of the chain
 * @returns The logo url of the chain
 */
export const getChainLogoUrl = (chainId: string) => {
  return BASE_APP_SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId)
    ?.logoUrl;
};

/**
 * IPFS gateway URLs in order of preference (with fallbacks)
 */
const IPFS_GATEWAYS = [
  "dweb.link",
  "ipfs.io",
  "latam.orbitor.dev",
  "eu.orbitor.dev",
] as const;

/**
 * Gets all gateway URLs for an IPFS CID in order of preference
 * @param cidOrUrl - IPFS CID (e.g., "bafybeia2m2j2aouj7mr7h2jk7k5algr4lx5vzq5hr5x3tl2m2gz67i6si4") or full URL
 * @returns Array of gateway URLs, or single-element array with the original URL if it's already a full URL
 */
export const getIpfsGatewayUrls = (cidOrUrl?: string | null): string[] => {
  if (!cidOrUrl) return [];

  // If it's already a full URL (starts with http:// or https://), return as-is
  if (cidOrUrl.startsWith("http://") || cidOrUrl.startsWith("https://")) {
    return [cidOrUrl];
  }

  // If it starts with "/", it's a relative path, return as-is
  if (cidOrUrl.startsWith("/")) {
    return [cidOrUrl];
  }

  // Otherwise, it's an IPFS CID - build URLs for all gateways
  // Format: https://{cid}.ipfs.{gateway}/
  return IPFS_GATEWAYS.map((gateway) => `https://${cidOrUrl}.ipfs.${gateway}/`);
};

/**
 * Builds a full image URL from an IPFS CID using the public dweb gateway or returns the URL as-is if it's already a full URL
 * @param cidOrUrl - IPFS CID (e.g., "bafybeia2m2j2aouj7mr7h2jk7k5algr4lx5vzq5hr5x3tl2m2gz67i6si4") or full URL
 * @returns Full URL using dweb gateway (https://{cid}.ipfs.dweb.link/), or the original URL if it's already a full URL
 * @deprecated Use getIpfsGatewayUrls for fallback support
 */
export const buildImageUrlFromCid = (cidOrUrl?: string | null): string => {
  const urls = getIpfsGatewayUrls(cidOrUrl);
  return urls[0] || "";
};

/**
 * Slugify a text (replace spaces and special characters with underscores and convert to lowercase, reduce multiple underscores to a single underscore)
 * @param text - The text to slugify
 * @returns The slugified text
 */
export const slugify = (text: string) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
};

/**
 * Calculate the time left for a poll
 * @param deadline - The deadline of the poll
 * @returns The time left for the poll
 */
export const calculateTimeLeft = (deadline: number | null) => {
  if (!deadline) return "0:00";
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = deadline - now;
  if (timeLeft <= 0) return "0:00";
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
