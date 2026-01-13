"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { usePyroLeaderboard } from "@/hooks/use-pyro-leaderboard";
import { Brand } from "@/lib/database/db.schema";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const OverlayPyro = ({ brand }: { brand: Brand }) => {
  const pyroMint = brand.pyroMint;

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } =
    usePyroLeaderboard({
      mint: "G5qKomPSAbPPt5ms4wAzDAC8Xin5zD8McXuVypuFpump",
      enabled: !!"G5qKomPSAbPPt5ms4wAzDAC8Xin5zD8McXuVypuFpump",
    });

  const leaderboard = leaderboardData?.data?.leaderboard || [];
  const topSponsor = leaderboard.find((entry) => entry.rank === 1);

  const isBrandTheRollup = brand.slug === THE_ROLLUP_BRAND_SLUG;

  // Get sponsor details
  const sponsorName =
    topSponsor?.externalSponsor?.name ||
    topSponsor?.promotedToken?.name ||
    "Anonymous";
  const sponsorImage =
    topSponsor?.externalSponsor?.sponsorImageUrl ||
    topSponsor?.promotedToken?.iconUrl;
  const advertisingMessage = topSponsor?.advertisingMetadata?.message;

  return (
    <div className="flex items-center justify-center min-h-[130px] w-[600px]">
      <AnimatePresence mode="wait">
        {/* Loading State */}
        {isLoadingLeaderboard && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex justify-center items-center w-full h-full">
            <Loader2 className="size-8 text-foreground animate-spin" />
          </motion.div>
        )}

        {/* No Pyro Connected */}
        {!isLoadingLeaderboard && !pyroMint && (
          <motion.div
            key="no-pyro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex justify-center items-center w-full h-full">
            <p className="text-muted-foreground">No Pyro account connected</p>
          </motion.div>
        )}

        {/* No Sponsors Yet */}
        {!isLoadingLeaderboard && pyroMint && !topSponsor && (
          <motion.div
            key="no-sponsors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex justify-center items-center w-full h-full">
            <p className="text-muted-foreground">No sponsors yet</p>
          </motion.div>
        )}

        {/* Top Sponsor Card */}
        {!isLoadingLeaderboard && pyroMint && topSponsor && (
          <motion.div
            key="top-sponsor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className={cn(
              "rounded-3xl shadow-lg p-4 flex flex-col justify-center items-center gap-3 min-w-[500px] border-8 font-overused-grotesk cursor-default",
              isBrandTheRollup
                ? "border-[#E6B45E] bg-[#1B2541]"
                : "border-primary bg-background",
            )}>
            {/* Sponsor Row */}
            <div className="flex justify-start items-center gap-4 w-full">
              {/* Sponsor Image */}
              {sponsorImage ? (
                <div className="relative size-14 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={sponsorImage}
                    alt={sponsorName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-14 rounded-full bg-muted shrink-0" />
              )}

              {/* Sponsor Name */}
              <p className="text-white text-2xl font-medium truncate">
                {sponsorName}{" "}
                <span className="font-bold">is sponsoring this stream</span>
              </p>
            </div>

            {/* Advertising Message */}
            {advertisingMessage && (
              <div className="flex justify-center items-center gap-3 w-full">
                <p className="text-foreground text-2xl font-medium">
                  &quot;{advertisingMessage}&quot;
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
