"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ToastKalshiNotification } from "@/components/custom-ui/toast/toast-kalshi-notification";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { Brand } from "@/lib/database/db.schema";
import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";
import {
  KalshiMarketEndedEvent,
  KalshiMarketStartedEvent,
} from "@/lib/types/socket/server-to-client.type";

export const OverlayKalshi = ({ brand }: { brand: Brand }) => {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();

  // Unified Kalshi market state and visibility flag
  type NormalizedKalshiMarket = {
    id: string;
    brandId: string;
    kalshiUrl: string;
    kalshiEventId: string;
    position: PopupPositions;
    durationMs: number; // Duration in milliseconds
  };

  const [_kalshiMarket, setKalshiMarket] =
    useState<NormalizedKalshiMarket | null>(null);
  const [showKalshiMarket, setShowKalshiMarket] = useState<boolean>(false);

  const toastId = useMemo(() => `kalshi-market-${brand.id}`, [brand]);

  const openToastFromKalshiMarket = useCallback(
    (market: NormalizedKalshiMarket) => {
      console.log("📊 OverlayKalshi: Creating toast with duration:", {
        marketId: market.id,
        durationMs: market.durationMs,
        durationMinutes: market.durationMs / 1000 / 60,
        toastId: toastId,
      });

      toast.custom(
        () => (
          <ToastKalshiNotification
            brandSlug={brand.slug}
            data={{
              id: market.id,
              brandId: market.brandId,
              kalshiUrl: market.kalshiUrl,
              kalshiEventId: market.kalshiEventId,
              position: market.position,
            }}
          />
        ),
        {
          id: toastId,
          duration: market.durationMs, // Use dynamic duration from event
          position: market.position,
          className: "flex items-center justify-center w-full",
        },
      );
    },
    [toastId, brand.slug],
  );

  // Handle Kalshi market started event
  const handleKalshiMarketStarted = useCallback(
    (data: KalshiMarketStartedEvent) => {
      // Only show if it's for this brand
      if (data.brandId !== brand.id) {
        return;
      }

      console.log("📊 OverlayKalshi: Received Kalshi Market with Duration:", {
        marketId: data.id,
        kalshiEventId: data.kalshiEventId,
        durationMs: data.durationMs,
        durationMinutes: data.durationMs / 1000 / 60,
        position: data.position,
      });

      const normalized: NormalizedKalshiMarket = {
        id: data.id,
        brandId: data.brandId,
        kalshiUrl: data.kalshiUrl,
        kalshiEventId: data.kalshiEventId,
        position: data.position,
        durationMs: data.durationMs,
      };

      setKalshiMarket(normalized);
      setShowKalshiMarket(true);
      openToastFromKalshiMarket(normalized);
    },
    [brand.id, openToastFromKalshiMarket],
  );

  // Handle Kalshi market ended event
  const handleKalshiMarketEnded = useCallback(
    (data: KalshiMarketEndedEvent) => {
      // Only handle if it's for this brand
      if (data.brandId !== brand.id) {
        return;
      }

      setShowKalshiMarket(false);
      setKalshiMarket(null);
      toast.dismiss(toastId);
    },
    [brand.id, toastId],
  );

  // Subscribe to socket events
  useEffect(() => {
    // Join the stream to receive events for this brand
    joinStream({
      brandId: brand.id,
      username: "Overlay",
      profilePicture: "https://via.placeholder.com/150",
    });

    subscribe(
      ServerToClientSocketEvents.KALSHI_MARKET_STARTED,
      handleKalshiMarketStarted,
    );

    subscribe(
      ServerToClientSocketEvents.KALSHI_MARKET_ENDED,
      handleKalshiMarketEnded,
    );

    return () => {
      unsubscribe(
        ServerToClientSocketEvents.KALSHI_MARKET_STARTED,
        handleKalshiMarketStarted,
      );
      unsubscribe(
        ServerToClientSocketEvents.KALSHI_MARKET_ENDED,
        handleKalshiMarketEnded,
      );
    };
  }, [
    subscribe,
    unsubscribe,
    handleKalshiMarketStarted,
    handleKalshiMarketEnded,
    joinStream,
    brand.id,
  ]);

  // Clean up toast when component unmounts or market changes
  useEffect(() => {
    if (!showKalshiMarket) {
      toast.dismiss(toastId);
    }
  }, [showKalshiMarket, toastId]);

  return (
    <div className="flex items-center justify-center min-h-[130px] w-[1000px]">
      <div className="flex h-full w-full">
        {/* Empty container - toast will be displayed by sonner */}
      </div>
    </div>
  );
};
