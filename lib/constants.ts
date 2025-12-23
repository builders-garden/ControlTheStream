import { Duration } from "@/lib/types/poll.type";
import { ChainImages, PopupPositions } from "./enums";

// The Rollup brand slug
export const THE_ROLLUP_BRAND_SLUG = "the_rollup";

// Builder code for transaction attribution
export const TRANSACTION_ATTRIBUTION_BUILDER_CODE = "bc_75b9zmna";

// Message expiration time for JWT token
export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

// OG image size
export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

// Farcaster embed size
export const FARCASTER_EMBED_SIZE = {
  width: 1500,
  height: 1000,
};

// Farcaster client FID
export const FARCASTER_CLIENT_FID = {
  farcaster: 9152, // farcaster web/mobile client fid
  base: 309857, // base mobile client fid
};

// USDC on Base constants
export const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const BASE_USDC_LOGO_URL =
  "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042194";

// Native token address
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Temporary bullmeter address on Base
export const BULLMETER_ADDRESS = "0x7bB86545242688D51204748292433a07270863B0";

// The maximum length of a custom message of a tip
export const MAX_TIP_CUSTOM_MESSAGE_LENGTH = 100;

// The minimum amount of a tip to add a custom message
export const MIN_TIP_AMOUNT_FOR_CUSTOM_MESSAGE = 5;

// Chain Explorer String URLs
export const TokenNameToChainExplorerStringUrls = {
  "1": "https://etherscan.io",
  "10": "https://optimistic.etherscan.io",
  "56": "https://bscscan.com",
  "137": "https://polygonscan.com",
  "8453": "https://basescan.org",
  "42161": "https://arbiscan.io",
  "43114": "https://snowtrace.io",
};

// List of Base App trade supported chains (name, symbol, chainId, logoUrl)
export const BASE_APP_SUPPORTED_CHAINS = [
  {
    name: "Base",
    symbol: "BASE",
    zerionName: "base",
    chainId: "8453",
    logoUrl: ChainImages.BASE,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    zerionName: "ethereum",
    chainId: "1",
    logoUrl: ChainImages.ETHEREUM,
  },
  {
    name: "Polygon",
    symbol: "MATIC",
    zerionName: "polygon",
    chainId: "137",
    logoUrl: ChainImages.POLYGON,
  },
  {
    name: "Optimism",
    symbol: "OP",
    zerionName: "optimism",
    chainId: "10",
    logoUrl: ChainImages.OPTIMISM,
  },
  {
    name: "Arbitrum",
    symbol: "ARB",
    zerionName: "arbitrum",
    chainId: "42161",
    logoUrl: ChainImages.ARBITRUM,
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    zerionName: "avalanche",
    chainId: "43114",
    logoUrl: ChainImages.AVALANCHE,
  },
  {
    name: "BNB Chain",
    symbol: "BNB",
    zerionName: "binance-smart-chain",
    chainId: "56",
    logoUrl: ChainImages.BNB,
  },
];

// Available durations for the sentiment poll
export const AVAILABLE_DURATIONS: Duration[] = [
  { label: "1 Minute", value: "1m", seconds: 60 },
  { label: "3 Minutes", value: "3m", seconds: 180 },
  { label: "5 Minutes", value: "5m", seconds: 300 },
  { label: "10 Minutes", value: "10m", seconds: 600 },
];

// Available overlay popup positions
export const AVAILABLE_POPUP_POSITIONS: {
  label: string;
  value: PopupPositions;
}[] = [
  {
    label: "Top Left",
    value: PopupPositions.TOP_LEFT,
  },
  {
    label: "Top Center",
    value: PopupPositions.TOP_CENTER,
  },
  {
    label: "Top Right",
    value: PopupPositions.TOP_RIGHT,
  },
  {
    label: "Bottom Left",
    value: PopupPositions.BOTTOM_LEFT,
  },
  {
    label: "Bottom Center",
    value: PopupPositions.BOTTOM_CENTER,
  },
  {
    label: "Bottom Right",
    value: PopupPositions.BOTTOM_RIGHT,
  },
];
