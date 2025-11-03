import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useKalshiGet } from "@/hooks/use-kalshi-get";
import {
  useActiveKalshiEvent,
  useKalshiDeactivate,
  useKalshiStore,
} from "@/hooks/use-kalshi-store";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { useTimer } from "@/hooks/use-timer";
import { PopupPositions } from "@/lib/enums";
import { KalshiApiResult } from "@/lib/types/kalshi.type";
import { KalshiConfirmation } from "./kalshi-confirmation";
import { KalshiMarketCard } from "./kalshi-market-card";
import { KalshiMultiMarketCard } from "./kalshi-multi-market-card";

export const KalshiContent = () => {
  const { brand, admin } = useAdminAuth();
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState<number>(5); // Default 5 minutes
  const [result, setResult] = useState<KalshiApiResult | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const [activeMarketData, setActiveMarketData] =
    useState<KalshiApiResult | null>(null);
  const [isLoadingActiveMarketData, setIsLoadingActiveMarketData] =
    useState(false);
  const [marketStartTime, setMarketStartTime] = useState<number | null>(null);
  const [marketDurationMs, setMarketDurationMs] = useState<number | null>(null);
  const timerStartedRef = useRef(false);
  const lastFetchedUrlRef = useRef<string | null>(null);

  // Initialize hooks
  const kalshiGetMutation = useKalshiGet();
  const kalshiStoreMutation = useKalshiStore();
  const kalshiDeactivateMutation = useKalshiDeactivate();
  const { adminStartKalshiMarket, adminEndKalshiMarket } = useSocketUtils();

  // Timer for active market
  const { timeString, remainingSeconds, startTimer, stopTimer } = useTimer({
    initialSeconds: 0,
    onEnd: async () => {
      console.log("⏰ Kalshi market timer ended, deactivating...");
      setIsLoadingActiveMarketData(false);
      setActiveMarketData(null);
      if (timerStartedRef.current) {
        stopTimer();
        timerStartedRef.current = false;
      }
      setMarketStartTime(null);
      setMarketDurationMs(null);
      lastFetchedUrlRef.current = null;
      await refetchActiveEvent();
    },
  });

  // Debug timer state
  useEffect(() => {
    if (marketStartTime && timeString) {
      console.log("⏰ Timer:", {
        timeString,
        remainingSeconds,
        marketStartTime,
      });
    }
  }, [timeString, remainingSeconds, marketStartTime]);

  // Check for active Kalshi event
  const {
    data: activeKalshiEvent,
    isLoading: isLoadingActiveEvent,
    error: activeEventError,
    refetch: refetchActiveEvent,
  } = useActiveKalshiEvent(brand?.data?.id || "");

  // Fetch live market data when active event is found
  useEffect(() => {
    const fetchActiveMarketData = async () => {
      if (activeKalshiEvent?.success && activeKalshiEvent.data.kalshiUrl) {
        const currentUrl = activeKalshiEvent.data.kalshiUrl;

        // Only fetch if this is a different URL than the last one we fetched
        if (lastFetchedUrlRef.current === currentUrl) {
          return;
        }

        lastFetchedUrlRef.current = currentUrl;
        setIsLoadingActiveMarketData(true);

        try {
          const response = await kalshiGetMutation.mutateAsync({
            url: currentUrl,
          });
          setActiveMarketData(response as KalshiApiResult);

          // Initialize timer if duration and activatedAt are available
          const eventDuration = activeKalshiEvent.data.duration; // in minutes from API
          const eventActivatedAt = activeKalshiEvent.data.activatedAt; // ISO string

          if (eventDuration && eventActivatedAt) {
            const now = Date.now(); // Current time in milliseconds
            const activatedTimeMs = new Date(eventActivatedAt).getTime(); // Parse ISO to milliseconds
            const durationMs = eventDuration * 60 * 1000; // Convert minutes to milliseconds
            const endTime = activatedTimeMs + durationMs;
            const remainingSeconds = Math.max(
              0,
              Math.floor((endTime - now) / 1000),
            );

            if (remainingSeconds > 0 && !timerStartedRef.current) {
              console.log("📊 Initializing timer from database:", {
                duration: eventDuration,
                activatedAt: eventActivatedAt,
                remainingSeconds,
                endTime,
                now,
              });

              setMarketStartTime(activatedTimeMs);
              setMarketDurationMs(durationMs);
              timerStartedRef.current = true;
              startTimer(remainingSeconds);
            } else if (remainingSeconds <= 0) {
              // Timer already expired, auto-deactivate
              console.log("⏰ Timer expired, market should be deactivated");
            }
          }
        } catch (error) {
          console.error("Error fetching active market data:", error);
          setActiveMarketData({
            success: false,
            error: "Failed to fetch live market data",
          });
          lastFetchedUrlRef.current = null; // Reset on error so we can retry
        } finally {
          setIsLoadingActiveMarketData(false);
        }
      } else {
        // No active market, reset timer state
        lastFetchedUrlRef.current = null;
        if (timerStartedRef.current) {
          stopTimer();
          timerStartedRef.current = false;
        }
        setMarketStartTime(null);
        setMarketDurationMs(null);
      }
    };

    fetchActiveMarketData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKalshiEvent]);

  const onConfirm = async () => {
    if (!url.trim()) return;

    setResult(null);

    try {
      const response = await kalshiGetMutation.mutateAsync({ url });
      setResult(response as KalshiApiResult);
    } catch (error) {
      console.error("Error calling Kalshi API:", error);
      setResult({
        success: false,
        error: "Failed to fetch Kalshi data",
      });
    }
  };

  const onAddToOverlay = async () => {
    if (!result || !result.success || !brand?.data?.id || !admin?.address)
      return;

    try {
      // Show loading state immediately
      setIsLoadingActiveMarketData(true);

      // Store the market in the database
      const storeResponse = await kalshiStoreMutation.mutateAsync({
        brandId: brand.data.id,
        kalshiData: {
          eventTitle: result.data.eventTitle,
          totalMarkets: result.data.totalMarkets,
        },
        kalshiUrl: url,
        duration: duration, // Pass duration in minutes
      });

      // Extract kalshiEventId from URL
      const urlParts = url.split("/");
      const kalshiEventId = urlParts[urlParts.length - 1]?.toUpperCase();
      const durationMs = duration * 60 * 1000; // Convert minutes to milliseconds

      console.log("📊 Kalshi Market Duration:", {
        inputDurationMinutes: duration,
        convertedDurationMs: durationMs,
        durationInMinutes: durationMs / 1000 / 60,
      });

      console.log("data socket start kalshi market", {
        id: storeResponse.data.eventId || "1",
        brandId: brand.data.id,
        kalshiUrl: url,
        kalshiEventId: kalshiEventId || "",
        position: PopupPositions.TOP_CENTER,
        durationMs: durationMs,
      });

      // Start the Kalshi market in the overlay via socket
      adminStartKalshiMarket({
        id: storeResponse.data.eventId || "1",
        brandId: brand.data.id,
        kalshiUrl: url,
        kalshiEventId: kalshiEventId || "",
        position: PopupPositions.TOP_CENTER,
        durationMs: durationMs,
      });

      console.log("Market added to overlay successfully:", storeResponse);

      // Set timer for the market
      setMarketStartTime(Date.now());
      setMarketDurationMs(durationMs);
      const durationSeconds = Math.floor(durationMs / 1000);
      timerStartedRef.current = true;
      startTimer(durationSeconds);

      // Reset form state
      setResult(null);
      setUrl("");
      setDuration(5); // Reset to default
      setShowAddNew(false);

      // Refetch active event to show the new market
      await refetchActiveEvent();
    } catch (error) {
      console.error("Error adding market to overlay:", error);
      setIsLoadingActiveMarketData(false);
      // You might want to show an error message to the user here
    }
  };

  const isConfirmDisabled =
    url.trim().length === 0 || kalshiGetMutation.isPending;
  const isAddingToOverlay = kalshiStoreMutation.isPending;

  // Function to deactivate current active event
  const onDeactivateEvent = async () => {
    if (
      !activeKalshiEvent?.success ||
      !activeKalshiEvent.data.eventId ||
      !brand?.data?.id
    ) {
      console.error("No active event ID found");
      return;
    }

    try {
      // End the Kalshi market in the overlay via socket
      adminEndKalshiMarket({
        id: activeKalshiEvent.data.eventId,
        brandId: brand.data.id,
      });

      const response = await kalshiDeactivateMutation.mutateAsync({
        eventId: activeKalshiEvent.data.eventId,
      });

      if (response.success) {
        console.log("Event deactivated successfully");
      } else {
        console.error("Failed to deactivate event:", response.error);
      }
    } catch (error) {
      console.error("Error deactivating event:", error);
    } finally {
      // Always clear loading state and reset timer, regardless of success/failure
      setIsLoadingActiveMarketData(false);

      // Stop the timer
      if (timerStartedRef.current) {
        stopTimer();
        timerStartedRef.current = false;
      }
      setMarketStartTime(null);
      setMarketDurationMs(null);
      lastFetchedUrlRef.current = null;
      setActiveMarketData(null);

      // Refetch active events to update UI
      await refetchActiveEvent();
    }
  };

  // Show loading state while checking for active events
  if (isLoadingActiveEvent || isLoadingActiveMarketData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-col justify-center items-center w-full h-full py-5 pr-5 gap-5">
        <div className="text-lg">Loading...</div>
      </motion.div>
    );
  }

  // Show active event if one exists and user hasn't clicked "Add New"
  if (activeKalshiEvent?.success && !showAddNew && activeMarketData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
        {/* Title with Green Light Indicator and Timer */}
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-2xl">Active Kalshi Market</h1>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-500 font-medium">Live</span>
            </div>
            {marketStartTime && timeString && timeString !== "00:00" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg border border-green-700">
                <span className="text-lg font-bold text-white">
                  {timeString}
                </span>
                <span className="text-xs text-white/80 font-medium">
                  remaining
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Market Preview */}
        {activeMarketData.success ? (
          <div className="w-full">
            <div className="mb-6">
              {/* Conditional rendering based on market count */}
              {activeMarketData.data.markets.length === 1 ? (
                // Single market - use individual card
                <div className="flex justify-center">
                  <KalshiMarketCard
                    market={activeMarketData.data.markets[0]}
                    eventTitle={activeMarketData.data.eventTitle}
                    kalshiUrl={activeMarketData.data.kalshiUrl}
                  />
                </div>
              ) : (
                // Multiple markets - use multi-market card
                <div className="flex justify-center">
                  <KalshiMultiMarketCard
                    markets={activeMarketData.data.markets}
                    eventTitle={activeMarketData.data.eventTitle}
                    totalMarkets={activeMarketData.data.totalMarkets}
                    kalshiUrl={activeMarketData.data.kalshiUrl}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mt-2">
              <button
                className="px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-200 
                  bg-destructive/10 hover:bg-destructive/20 text-destructive
                  border-2 border-destructive/30 hover:border-destructive/50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-sm hover:shadow-md hover:scale-105"
                disabled={kalshiDeactivateMutation.isPending}
                onClick={onDeactivateEvent}>
                {kalshiDeactivateMutation.isPending
                  ? "Removing..."
                  : "Remove from Overlay"}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600">
              <h3 className="font-bold text-lg mb-2">Error Loading Market</h3>
              <p>{activeMarketData.error}</p>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Show add new form (when no active event or user clicked "Add New")
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <div className="flex justify-between items-center w-full">
        <h1 className="font-bold text-2xl">
          Connect a Kalshi market URL to enhance your livestream with real-time
          predictions.
        </h1>
      </div>
      <div className="flex flex-col justify-start items-start w-full gap-4">
        <label className="text-sm opacity-70">Kalshi market URL</label>
        <input
          type="url"
          placeholder="https://kalshi.com/markets/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full max-w-xl px-4 py-2 rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
        />
        <CTSButton
          className="rounded-full w-fit"
          variant="default"
          disabled={isConfirmDisabled}
          onClick={onConfirm}>
          {kalshiGetMutation.isPending ? "Loading..." : "Confirm"}
        </CTSButton>
      </div>

      {/* Display API Response */}
      {result && (
        <KalshiConfirmation
          result={result}
          isAddingToOverlay={isAddingToOverlay}
          duration={duration}
          onDurationChange={setDuration}
          onAddToOverlay={onAddToOverlay}
          onCancel={() => {
            setResult(null);
          }}
        />
      )}
    </motion.div>
  );
};
