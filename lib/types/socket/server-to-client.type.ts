import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";

export type StreamJoinedEvent = {
  brandId: string;
  username: string;
  profilePicture: string;
};

export type TipReceivedEvent = {
  brandId: string;
  position: PopupPositions;
  username: string;
  profilePicture: string;
  tipAmount: string;
  customMessage: string;
};

export type TokenTradeEvent = {
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

export type VoteReceivedEvent = {
  brandId: string;
  position: PopupPositions;
  username: string;
  profilePicture: string;
  voteAmount: string;
  isBull: boolean;
  promptId: string;
};

export type ErrorEvent = {
  brandId: string;
  code: number;
  message: string;
};

export type PollNotificationEvent = {
  id: string;
  brandId: string;
  pollQuestion: string;
  endTimeMs: number;
  votes: number;
  voters: number;
  qrCodeUrl: string;
  position: PopupPositions;
  results?: {
    bullPercent: number;
    bearPercent: number;
  };
};

export type EndPollNotificationEvent = {
  id: string;
  brandId: string;
  pollQuestion: string;
  endTimeMs: number;
  votes: number;
  voters: number;
  qrCodeUrl: string;
  position: PopupPositions;
  results?: {
    bullPercent: number;
    bearPercent: number;
  };
};
export type UpdatePollNotificationEvent = {
  id: string;
  brandId: string;
  position: PopupPositions;
  voters: number;
  votes: number;
  endTimeMs: number;
  results?: {
    bullPercent: number;
    bearPercent: number;
  };
};

export type KalshiMarketStartedEvent = {
  id: string; // ID stored in the database
  brandId: string;
  kalshiUrl: string;
  kalshiEventId: string;
  position: PopupPositions;
  durationMs: number; // Duration in milliseconds
};

export type KalshiMarketEndedEvent = {
  id: string;
  brandId: string;
};

export type ServerToClientEvents = {
  [ServerToClientSocketEvents.STREAM_JOINED]: StreamJoinedEvent;
  [ServerToClientSocketEvents.ERROR]: ErrorEvent;
  [ServerToClientSocketEvents.TIP_RECEIVED]: TipReceivedEvent;
  [ServerToClientSocketEvents.TOKEN_TRADED]: TokenTradeEvent;
  [ServerToClientSocketEvents.VOTE_RECEIVED]: VoteReceivedEvent;
  [ServerToClientSocketEvents.START_SENTIMENT_POLL]: PollNotificationEvent;
  [ServerToClientSocketEvents.END_SENTIMENT_POLL]: EndPollNotificationEvent;
  [ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL]: UpdatePollNotificationEvent;
  [ServerToClientSocketEvents.KALSHI_MARKET_STARTED]: KalshiMarketStartedEvent;
  [ServerToClientSocketEvents.KALSHI_MARKET_ENDED]: KalshiMarketEndedEvent;
};
