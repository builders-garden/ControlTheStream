import { ClientToServerSocketEvents, PopupPositions } from "@/lib/enums";
import { Guest } from "../poll.type";

export type JoinStreamEvent = {
  brandId: string;
  username: string;
  profilePicture: string;
};

export type TipSentEvent = {
  brandId: string;
  position: PopupPositions;
  username: string;
  profilePicture: string;
  tipAmount: string;
  customMessage: string;
};

export type TokenTradedEvent = {
  brandId: string;
  position: PopupPositions;
  username: string;
  profilePicture: string;
  tokenInAmount: string;
  tokenInName: string;
  tokenInDecimals: number;
  tokenInImageUrl: string;
  tokenOutAmount: string;
  tokenOutDecimals: number;
  tokenOutName: string;
  tokenOutImageUrl: string;
};

export type VoteCastedEvent = {
  brandId: string;
  position: PopupPositions;
  username: string;
  profilePicture: string;
  voteAmount: string;
  isBull: boolean;
  promptId: string;
  endTimeMs: number;
};

export type StartSentimentPollEvent = {
  id: string;
  brandId: string;
  position: PopupPositions;
  pollQuestion: string;
  endTimeMs: number;
  guests: Guest[];
  results: { bullPercent: number; bearPercent: number };
};

export type EndSentimentPollEvent = {
  id: string;
  brandId: string;
  votes: number;
  voters: number;
  results: { bullPercent: number; bearPercent: number };
};

export type UpdateSentimentPollEvent = {
  id: string;
  brandId: string;
  position: PopupPositions;
  endTimeMs: number;
  voters: number;
  votes: number;
  results: { bullPercent: number; bearPercent: number };
};

export type KalshiMarketOption = {
  optionId: string;
  optionName: string;
  price: string;
  ticker: string;
};

export type StartKalshiMarketEvent = {
  id: string; // ID stored in the database
  brandId: string;
  kalshiUrl: string;
  kalshiEventId: string;
  position: PopupPositions;
  durationMs: number; // Duration in milliseconds
};

export type UpdateKalshiMarketEvent = {
  id: string;
  brandId: string;
  position: PopupPositions;
  closeTime: string;
  // For binary markets (yes/no)
  yesPrice?: string;
  noPrice?: string;
  // For aggregated option markets
  options?: KalshiMarketOption[];
};

export type EndKalshiMarketEvent = {
  id: string;
  brandId: string;
};
export type ClientToServerEvents = {
  [ClientToServerSocketEvents.JOIN_STREAM]: JoinStreamEvent;
  [ClientToServerSocketEvents.TIP_SENT]: TipSentEvent;
  [ClientToServerSocketEvents.TOKEN_TRADED]: TokenTradedEvent;
  [ClientToServerSocketEvents.VOTE_CASTED]: VoteCastedEvent;
  [ClientToServerSocketEvents.START_SENTIMENT_POLL]: StartSentimentPollEvent;
  [ClientToServerSocketEvents.END_SENTIMENT_POLL]: EndSentimentPollEvent;
  [ClientToServerSocketEvents.UPDATE_SENTIMENT_POLL]: UpdateSentimentPollEvent;
  [ClientToServerSocketEvents.START_KALSHI_MARKET]: StartKalshiMarketEvent;
  [ClientToServerSocketEvents.UPDATE_KALSHI_MARKET]: UpdateKalshiMarketEvent;
  [ClientToServerSocketEvents.END_KALSHI_MARKET]: EndKalshiMarketEvent;
};
