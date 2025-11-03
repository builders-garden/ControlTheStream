export interface KalshiPriceRange {
  start: string;
  end: string;
  step: string;
}

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  open_time: string;
  close_time: string;
  expiration_time: string;
  latest_expiration_time: string;
  settlement_timer_seconds: number;
  status: string;
  response_price_units: string;
  notional_value: number;
  notional_value_dollars: string;
  tick_size: number;
  yes_bid: number;
  yes_bid_dollars: string;
  yes_ask: number;
  yes_ask_dollars: string;
  no_bid: number;
  no_bid_dollars: string;
  no_ask: number;
  no_ask_dollars: string;
  last_price: number;
  last_price_dollars: string;
  previous_yes_bid: number;
  previous_yes_bid_dollars: string;
  previous_yes_ask: number;
  previous_yes_ask_dollars: string;
  previous_price: number;
  previous_price_dollars: string;
  volume: number;
  volume_24h: number;
  liquidity: number;
  liquidity_dollars: string;
  open_interest: number;
  result: string;
  can_close_early: boolean;
  expiration_value: string;
  category: string;
  risk_limit_cents: number;
  rules_primary: string;
  rules_secondary: string;
  settlement_value: number;
  settlement_value_dollars: string;
  price_level_structure: string;
  price_ranges: KalshiPriceRange[];
}

export interface KalshiEvent {
  available_on_brokers: boolean;
  category: string;
  collateral_return_type: string;
  event_ticker: string;
  markets: KalshiMarket[];
  mutually_exclusive: boolean;
  series_ticker: string;
  strike_date: any;
  strike_period: string;
  sub_title: string;
  title: string;
}

export interface KalshiApiResponse {
  event: KalshiEvent;
  markets: KalshiMarket[];
}

export interface KalshiApiError {
  success: false;
  error: string;
}

export interface KalshiMarketDisplay {
  closeTime: string;
  title: string;
  yesPrice: string;
  noPrice: string;
  status: string;
  ticker: string;
  noSubTitle: string; // Add no_sub_title for candidate names
}

export interface KalshiApiSuccess {
  success: true;
  data: {
    eventId?: string; // Optional: Only present when fetching active events from DB
    eventTitle: string;
    markets: KalshiMarketDisplay[];
    totalMarkets: number; // Total number of markets available
    kalshiUrl: string; // Original Kalshi URL
    duration?: number; // Duration in minutes, when available
    activatedAt?: string; // ISO timestamp when event was activated, when available
  };
}

export type KalshiApiResult = KalshiApiSuccess | KalshiApiError;
