import { motion } from "motion/react";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { KalshiApiResult } from "@/lib/types/kalshi.type";
import { KalshiMarketCard } from "./kalshi-market-card";
import { KalshiMultiMarketCard } from "./kalshi-multi-market-card";

interface KalshiConfirmationProps {
  result: KalshiApiResult;
  isAddingToOverlay: boolean;
  duration: number;
  onDurationChange: (duration: number) => void;
  onAddToOverlay: () => void;
  onCancel: () => void;
}

export const KalshiConfirmation = ({
  result,
  isAddingToOverlay,
  duration,
  onDurationChange,
  onAddToOverlay,
  onCancel,
}: KalshiConfirmationProps) => {
  if (!result.success) {
    return (
      <div className="w-full p-6 bg-card border border-destructive/50 rounded-lg">
        <div className="text-destructive">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      {/* Market Preview Section */}
      <div className="mb-6">
        <h2 className="font-semibold text-foreground text-2xl mb-4 text-center">
          Market Preview
        </h2>
        {/* Conditional rendering based on market count */}
        {result.data.markets.length === 1 ? (
          // Single market - use individual card
          <div className="flex justify-center">
            <KalshiMarketCard
              market={result.data.markets[0]}
              eventTitle={result.data.eventTitle}
              kalshiUrl={result.data.kalshiUrl}
            />
          </div>
        ) : (
          // Multiple markets - use multi-market card
          <div className="flex justify-center">
            <KalshiMultiMarketCard
              markets={result.data.markets}
              eventTitle={result.data.eventTitle}
              totalMarkets={result.data.totalMarkets}
              kalshiUrl={result.data.kalshiUrl}
            />
          </div>
        )}
      </div>

      {/* Confirmation Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-lg p-6">
        <div className="text-foreground">
          <h3 className="font-bold text-lg mb-3">Ready to Add to Overlay?</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            This market will be visible in the streaming overlay for your
            audience to see real-time predictions.
          </p>

          {/* Duration Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Toast Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="w-full max-w-xs px-4 py-2 rounded-md border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
              placeholder="5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              How long the toast should stay visible in the overlay
            </p>
          </div>

          <div className="flex gap-3">
            <CTSButton
              className="rounded-full"
              variant="default"
              disabled={isAddingToOverlay}
              onClick={onAddToOverlay}>
              {isAddingToOverlay ? "Adding..." : "Add to Overlay"}
            </CTSButton>
            <CTSButton
              className="rounded-full"
              variant="outline"
              onClick={onCancel}>
              Cancel
            </CTSButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
