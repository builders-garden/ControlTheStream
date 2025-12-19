"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";
import { useKalshiGet } from "@/hooks/use-kalshi-get";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { ServerToClientSocketEvents } from "@/lib/enums";
import { KalshiMarketStartedEvent } from "@/lib/types/socket/server-to-client.type";
import { cn } from "@/lib/utils";

export interface KalshiNotificationData {
  id: string; // ID stored in the database
  brandId: string;
  kalshiUrl: string;
  kalshiEventId: string;
  position: string;
}

export const ToastKalshiNotification = ({
  data,
  brandSlug,
}: {
  data: KalshiNotificationData;
  brandSlug: string;
}) => {
  console.log("ToastKalshiNotification mounted with data:", data);

  // Whether the brand is the Rollup
  const isBrandTheRollup = brandSlug === THE_ROLLUP_BRAND_SLUG;
  console.log("brandSlug", brandSlug);

  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();
  const kalshiGetMutation = useKalshiGet();

  // Use the mutation's built-in state instead of managing our own
  const kalshiData = kalshiGetMutation.data || null;
  const isLoading = kalshiGetMutation.isPending;
  const error = kalshiGetMutation.error ? "Failed to load market data" : null;

  // Create event handler for Kalshi market started event
  const handleKalshiMarketStarted = (eventData: KalshiMarketStartedEvent) => {
    console.log("Received Kalshi market started event:", eventData);
    // This component is already handling the specific market, so we can ignore updates
    // or refresh the data if needed
  };

  // Subscribe to socket events
  useEffect(() => {
    // Join the stream
    joinStream({
      brandId: data.brandId,
      username: "Kalshi Market",
      profilePicture: "https://via.placeholder.com/150",
    });

    // Subscribe to Kalshi market events
    console.log("subscribe to kalshi market started event");
    console.log("data", data);
    subscribe(
      ServerToClientSocketEvents.KALSHI_MARKET_STARTED,
      handleKalshiMarketStarted,
    );

    return () => {
      unsubscribe(
        ServerToClientSocketEvents.KALSHI_MARKET_STARTED,
        handleKalshiMarketStarted,
      );
    };
  }, [data.brandId, joinStream, subscribe, unsubscribe]);

  // Fetch Kalshi market data when component mounts
  useEffect(() => {
    console.log("Fetching Kalshi data for URL:", data.kalshiUrl);

    // Trigger the mutation only once when component mounts
    kalshiGetMutation.mutate({
      url: data.kalshiUrl,
    });
  }, [data.kalshiUrl]); // Only depend on the URL, not the mutation

  // Compute directional offsets based on toast position
  const isLeft = data.position?.includes("left");
  const isRight = data.position?.includes("right");
  const isCenter = data.position?.includes("center");
  const isTop = data.position?.startsWith("top");
  const xOffset = isLeft ? 100 : isRight ? -100 : 0;
  const yOffset = isCenter ? (isTop ? 100 : -100) : 0;

  // Render single market
  const renderSingleMarket = (_market: {
    title: string;
    yesPrice: string;
    noPrice: string;
  }) => {
    const yesPriceFloat = Math.max(0, parseFloat(_market.yesPrice || "0"));
    const noPriceFloat = Math.max(
      0,
      _market.noPrice ? parseFloat(_market.noPrice) : 1 - yesPriceFloat,
    );
    const yesPercent = Math.round(yesPriceFloat * 100);
    const noPercent = Math.round(noPriceFloat * 100);
    const yesPriceLabel = `${yesPercent}%`;
    const noPriceLabel = `${noPercent}%`;

    return (
      <div
        className={cn(
          "rounded-xl shadow-lg px-3 py-3 min-w-[760px] min-h-[96px] border-4 backdrop-blur-[150px]",
          isBrandTheRollup
            ? "bg-black/70 border-[#E6B45E]"
            : "bg-black/70 border-[#3b82f6]",
        )}>
        {/* Header: title + QR + green label */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 pr-10">
            <h3 className="text-white font-black text-[26px] leading-7 text-left">
              {kalshiData?.success ? kalshiData.data.eventTitle : _market.title}
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="bg-white p-1">
              <QRCodeSVG value={data.kalshiUrl} size={66} level="M" />
            </div>
            <div className="text-[#00d296] font-bold text-lg mt-1">
              Powered by Kalshi
            </div>
          </div>
        </div>

        {/* Options: two buttons YES/NO with prices */}
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-1">
            <div className="rounded-sm bg-white px-1 py-0.5 text-center border border-white/40">
              <div className="inline-flex items-center justify-center gap-1 leading-none align-middle">
                <span className="text-[#4CAF50] font-extrabold uppercase tracking-tight text-base">
                  Yes
                </span>
                <span className="text-black font-black tracking-tight text-lg">
                  {yesPriceLabel}
                </span>
              </div>
            </div>
            <div className="rounded-sm bg-white px-1 py-0.5 text-center border border-white/40">
              <div className="inline-flex items-center justify-center gap-1 leading-none align-middle">
                <span className="text-[#CF5953] font-extrabold uppercase tracking-tight text-base">
                  No
                </span>
                <span className="text-black font-black tracking-tight text-lg">
                  {noPriceLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render multiple markets
  const renderMultipleMarkets = () => {
    if (!kalshiData?.success || !kalshiData.data.markets) return null;

    // Build list with bars like the reference
    const marketsAll = kalshiData.data.markets as Array<{
      title: string;
      yesPrice: string;
      noSubTitle?: string;
      ticker: string;
    }>;

    const scoredAll = marketsAll.map((m, i) => ({
      index: i,
      name: m.noSubTitle || m.title || `Option ${i + 1}`,
      pct: Math.round(parseFloat(m.yesPrice) * 100),
      ticker: m.ticker,
    }));

    const scored = scoredAll.slice(0, 3);

    return (
      <div
        className={cn(
          "rounded-xl shadow-lg px-3 py-3 min-w-[760px] min-h-[96px] border-4 backdrop-blur-[150px]",
          isBrandTheRollup
            ? "bg-black/70 border-[#E6B45E]"
            : "bg-black/70 border-[#3b82f6]",
        )}>
        {/* Header: title + QR */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 pr-10">
            <h3 className="text-white font-black text-[26px] leading-7 text-left">
              {kalshiData.data.eventTitle}
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="bg-white p-0.5">
              <QRCodeSVG value={data.kalshiUrl} size={84} level="M" />
            </div>
            <div className="text-[#00d296] font-bold text-lg mt-1">
              Powered by Kalshi
            </div>
          </div>
        </div>

        {/* Options grid (3 price boxes with names) */}
        <div className="mt-2">
          <div className="grid grid-cols-3 gap-1">
            {scored.map((m) => {
              const percentLabel = `${m.pct}%`;
              return (
                <div
                  key={m.ticker}
                  className="relative flex justify-center items-center rounded-sm bg-white px-2 py-1 text-center h-[64px]">
                  <div className="text-black font-extrabold tracking-tight mb-0.5 truncate text-lg">
                    {m.name}
                  </div>
                  <div className="absolute flex justify-center items-center px-1.5 top-0 right-0 rounded-bl-sm rounded-tr-sm bg-primary">
                    <span className="text-black font-extrabold tracking-tight align-middle">
                      {percentLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* No extra markets label */}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait" initial={true}>
      <motion.div
        key={data.id}
        initial={{
          opacity: 0,
          x: xOffset,
          y: yOffset,
          scale: 0.75,
        }}
        animate={{
          opacity: 1,
          y: 0,
          x: 0,
          scale: [0.75, 1.2, 1],
          transition: {
            duration: 0.9,
            ease: [0.19, 1.0, 0.22, 1.0],
            opacity: { duration: 0.2 },
            scale: { times: [0, 0.6, 1], duration: 0.9 },
          },
        }}
        exit={{
          opacity: 0,
          x: xOffset ? -xOffset : 0,
          y: yOffset ? -yOffset : 50,
          scale: 0.8,
          transition: { duration: 0.4 },
        }}
        className="flex flex-col gap-1 font-overused-grotesk w-full">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className={cn(
                "rounded-xl shadow-lg px-3 py-5 min-w-[680px] min-h-[88px] border-4 flex justify-center items-center",
                isBrandTheRollup
                  ? "bg-[#1B2541] border-[#E6B45E]"
                  : "bg-[#1B2541] border-[#3b82f6]",
              )}>
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="size-8 text-[#E6B45E] animate-spin" />
                <div className="text-white font-bold text-lg">
                  Loading Kalshi Market...
                </div>
                <div className="text-gray-400 text-sm">Fetching live data</div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "rounded-xl shadow-lg px-3 py-5 min-w-[680px] min-h-[88px] border-4 flex justify-center items-center",
                isBrandTheRollup
                  ? "bg-[#1B2541] border-red-500"
                  : "bg-[#1B2541] border-red-500",
              )}>
              <div className="text-center">
                <div className="text-red-500 font-bold text-lg mb-2">Error</div>
                <div className="text-white text-sm">{error}</div>
              </div>
            </motion.div>
          ) : kalshiData?.success && kalshiData.data ? (
            <motion.div
              key="market-data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>
              {kalshiData.data.totalMarkets === 1
                ? renderSingleMarket(kalshiData.data.markets[0])
                : renderMultipleMarkets()}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
