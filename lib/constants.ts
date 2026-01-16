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

// Kalshi Testing URLs
export const KALSHI_TESTING_URL_SINGLE = "cta-testing-kalshi-url-single";
export const KALSHI_TESTING_URL_MULTIPLE = "cta-testing-kalshi-url-multiple";

// Kalshi Testing Event IDs
export const KALSHI_TESTING_EVENT_ID_SINGLE =
  "cta-testing-kalshi-event-id-single";
export const KALSHI_TESTING_EVENT_ID_MULTIPLE =
  "cta-testing-kalshi-event-id-multiple";

// Testing Kalshi Data for single and multiple markets
export const TESTING_KALSHI_SINGLE = {
  success: true,
  data: {
    eventTitle: "Will the Supreme Court rule in favor of Trump's tariffs?",
    markets: [
      {
        title:
          "Will the Supreme Court rule in favor of Trump in V.O.S. Selections, Inc. v. Trump",
        yesPrice: "0.3400",
        noPrice: "0.6400",
        status: "active",
        ticker: "KXDJTVOSTARIFFS",
        noSubTitle: "Before 2028",
        closeTime: "2028-01-01T15:00:00Z",
      },
    ],
    totalMarkets: 1,
    kalshiUrl: "cta-testing-kalshi-url-single",
  },
};
export const TESTING_KALSHI_MULTIPLE = {
  success: true,
  data: {
    eventTitle: "Hellas Verona vs Bologna Winner?",
    markets: [
      {
        title: "Hellas Verona vs Bologna Winner?",
        yesPrice: "0.8000",
        noPrice: "0.1800",
        status: "active",
        ticker: "KXSERIEAGAME-26JAN15VERBFC-BFC",
        noSubTitle: "Bologna",
        closeTime: "2026-01-29T17:30:00Z",
      },
      {
        title: "Hellas Verona vs Bologna Winner?",
        yesPrice: "0.1500",
        noPrice: "0.8300",
        status: "active",
        ticker: "KXSERIEAGAME-26JAN15VERBFC-TIE",
        noSubTitle: "Tie",
        closeTime: "2026-01-29T17:30:00Z",
      },
      {
        title: "Hellas Verona vs Bologna Winner?",
        yesPrice: "0.0100",
        noPrice: "0.9700",
        status: "active",
        ticker: "KXSERIEAGAME-26JAN15VERBFC-VER",
        noSubTitle: "Hellas Verona",
        closeTime: "2026-01-29T17:30:00Z",
      },
    ],
    totalMarkets: 3,
    kalshiUrl: "cta-testing-kalshi-url-multiple",
  },
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
