// Pyro OTP Auth Types

export interface PyroRequestOtpResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface PyroUser {
  userId: string;
  email: string;
  displayName: string;
  wallet: string;
}

export interface PyroCreator {
  creatorMint: string;
  name: string;
  symbol: string;
  ticker: string;
  iconUrl: string;
  decimals: number;
  streamerUsername: string;
  twitterHandle: string;
  streamUrl: string;
  dexUrl: string;
  isLive: boolean;
  totalTokensBurned: number;
  totalBurns: number;
  isSplit: boolean;
}

export interface PyroVerifyOtpResponse {
  success: boolean;
  user: PyroUser;
  creator: PyroCreator | null;
}

// Pyro Leaderboard Types

export interface PyroCreatorToken {
  mint: string;
  name: string;
  symbol: string;
  iconUrl: string;
  ticker: string;
}

export interface PyroPromotedToken {
  mint: string;
  name: string;
  symbol: string;
  ticker: string;
  iconUrl: string;
  description: string;
  websiteUrl: string;
  dexUrl: string;
  decimals: number;
}

export interface PyroExternalSponsor {
  name: string;
  description: string;
  websiteUrl: string;
  twitterHandle: string;
  sponsorImageUrl: string;
}

export interface PyroTopContributor {
  wallet: string;
  userId: string;
  contributedAmount: number;
}

export interface PyroAdvertisingMetadata {
  message: string | null;
}

export interface PyroLeaderboardEntry {
  rank: number;
  creatorToken: PyroCreatorToken;
  promotedToken: PyroPromotedToken | null;
  externalSponsor: PyroExternalSponsor | null;
  sponsorType: "external" | "token";
  totalBurned: number;
  totalUsdBurnValue: number;
  burnCount: number;
  lastBurnAt: string;
  topContributor: PyroTopContributor;
  advertisingMetadata: PyroAdvertisingMetadata;
}

export interface PyroLinkedPlatform {
  mint: string;
  name: string;
  symbol: string;
  iconUrl: string;
}

export interface PyroLinkedPlatforms {
  creatorLinkGroupId: string;
  platforms: {
    pump?: PyroLinkedPlatform;
    zora?: PyroLinkedPlatform;
  };
}

export interface PyroPriceToSponsorTop {
  topBurnedAmount: number;
  solNeeded: number;
  solPriceUsd: number;
  usdNeeded: number;
  tokenPriceInSol: number;
}

export interface PyroLeaderboardResponse {
  leaderboard: PyroLeaderboardEntry[];
  session: null;
  creatorMint: string;
  linkedPlatforms?: PyroLinkedPlatforms;
  priceToSponsorTop: PyroPriceToSponsorTop | null;
}
