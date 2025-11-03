import { motion } from "motion/react";
import { KalshiMarketDisplay } from "@/lib/types/kalshi.type";

interface KalshiMultiMarketCardProps {
  markets: KalshiMarketDisplay[];
  eventTitle: string;
  totalMarkets: number; // Add total markets count
  kalshiUrl?: string; // Add optional Kalshi URL
}

export const KalshiMultiMarketCard = ({
  markets,
  eventTitle,
  totalMarkets,
  kalshiUrl,
}: KalshiMultiMarketCardProps) => {
  // Limit to max 3 markets
  const displayMarkets = markets.slice(0, 3);
  const hasMoreMarkets = totalMarkets > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-2xl bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-bold text-xl text-foreground leading-tight mb-2">
          {eventTitle}
        </h3>
        {kalshiUrl && (
          <div className="mb-3">
            <a
              href={kalshiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 underline hover:no-underline transition-colors duration-200">
              View this market on Kalshi
            </a>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
            active
          </span>
          <span className="text-xs text-muted-foreground">
            {totalMarkets} market{totalMarkets !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Markets List */}
      <div className="space-y-3">
        {displayMarkets.map((market, index) => {
          // Use no_sub_title for candidate name
          const candidateName = market.noSubTitle || "Unknown";

          // Calculate percentage from yes price
          const yesPriceNum = parseFloat(market.yesPrice);
          const percentage = Math.round(yesPriceNum * 100);

          return (
            <motion.div
              key={`${market.ticker}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/40 transition-colors duration-200">
              {/* Left side - Candidate info */}
              <div className="flex-1">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {candidateName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {market.title.includes("Democratic")
                      ? "Democratic Nominee"
                      : market.title.includes("Republican")
                        ? "Republican Nominee"
                        : market.title.includes("Independent")
                          ? "Independent"
                          : "Candidate"}
                  </p>
                </div>
              </div>

              {/* Center - Percentage */}
              <div className="text-center mx-4">
                <div className="text-lg font-bold text-foreground">
                  {percentage}%
                </div>
              </div>

              {/* Right side - Yes/No buttons */}
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors duration-200">
                  Yes {percentage}%
                </button>
                <button className="px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-md hover:bg-purple-600 transition-colors duration-200">
                  No {100 - percentage}%
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show more indicator */}
      {hasMoreMarkets && (
        <div className="mt-4 pt-3 border-t border-border text-center">
          <span className="text-xs text-muted-foreground">
            {totalMarkets - 3} more
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-border">
        <div className="flex justify-end">
          <div className="text-xs">
            <span className="text-muted-foreground">powered by </span>
            <span className="text-green-600 font-bold">Kalshi</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
