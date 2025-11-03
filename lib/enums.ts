// Chain Images
export enum ChainImages {
  ETHEREUM = "/chains/ethereum-logo.svg",
  OPTIMISM = "/chains/optimism-logo.svg",
  POLYGON = "/chains/polygon-logo.svg",
  BASE = "/chains/base-logo.svg",
  ARBITRUM = "/chains/arbitrum-logo.svg",
  AVALANCHE = "/chains/avalanche-logo.svg",
  BNB = "/chains/bnb-logo.svg",
}

// Admin Page Content
export enum AdminPageContent {
  BRAND = "brand",
  PLUGINS = "plugins",
  OVERLAY = "overlay",
  ANALYTICS = "analytics",
  NOTIFICATIONS = "notifications",
}

// Analytics Tabs
export enum AnalyticsTabs {
  TIPS = "tips",
  POLLS = "polls",
}

// Brand Tabs
export enum BrandTabs {
  INFO = "info",
  ACCESS = "access",
  HOSTS = "hosts",
}

// Plugins Tabs
export enum PluginsTabs {
  TIPS = "tips",
  TOKENS = "tokens",
  SENTIMENT = "sentiment",
  KALSHI = "kalshi",
}

// Overlay Tabs
export enum OverlayTabs {
  POPUPS = "popups",
}

// Notifications Tabs
export enum NotificationsTabs {
  SEND = "send",
  HISTORY = "history",
}

// Popup Positions
export enum PopupPositions {
  TOP_LEFT = "top-left",
  TOP_RIGHT = "top-right",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
  TOP_CENTER = "top-center",
  BOTTOM_CENTER = "bottom-center",
}

// client to server
export enum ClientToServerSocketEvents {
  TIP_SENT = "tip_sent",
  TOKEN_TRADED = "token_traded",
  VOTE_CASTED = "vote_casted",
  JOIN_STREAM = "stream_joined",
  START_SENTIMENT_POLL = "start_sentiment_poll",
  END_SENTIMENT_POLL = "end_sentiment_poll",
  UPDATE_SENTIMENT_POLL = "update_sentiment_poll",
  START_KALSHI_MARKET = "start_kalshi_market",
  UPDATE_KALSHI_MARKET = "update_kalshi_market",
  END_KALSHI_MARKET = "end_kalshi_market",
}

// server to client
export enum ServerToClientSocketEvents {
  TIP_RECEIVED = "tip_received",
  VOTE_RECEIVED = "vote_received",
  TOKEN_TRADED = "token_traded",
  STREAM_JOINED = "stream_joined",
  START_SENTIMENT_POLL = "start_sentiment_poll",
  END_SENTIMENT_POLL = "end_sentiment_poll",
  EXTEND_SENTIMENT_POLL = "extend_sentiment_poll",
  UPDATE_SENTIMENT_POLL = "update_sentiment_poll",
  KALSHI_MARKET_STARTED = "kalshi_market_started",
  KALSHI_MARKET_ENDED = "kalshi_market_ended",
  ERROR = "error",
}

export enum AuthTokenType {
  WEB_APP_AUTH_TOKEN = "web_app_auth_token",
  MINI_APP_AUTH_TOKEN = "mini_app_auth_token",
  ADMIN_AUTH_TOKEN = "admin_auth_token",
}
