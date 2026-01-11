import { ExternalLink, Trophy } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { PyroLeaderboardEntry } from "@/lib/types/pyro.types";
import { cn } from "@/lib/utils";

interface PyroLeaderboardEntryProps {
  entry: PyroLeaderboardEntry;
  index: number;
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "text-yellow-500";
    case 2:
      return "text-gray-400";
    case 3:
      return "text-amber-600";
    default:
      return "text-muted-foreground";
  }
};

const getRankBgColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-yellow-500/10 border-yellow-500/20";
    case 2:
      return "bg-gray-400/10 border-gray-400/20";
    case 3:
      return "bg-amber-600/10 border-amber-600/20";
    default:
      return "bg-muted/50 border-muted";
  }
};

export const PyroLeaderboardEntryCard = ({
  entry,
  index,
}: PyroLeaderboardEntryProps) => {
  const sponsorName =
    entry.externalSponsor?.name || entry.promotedToken?.name || "Anonymous";
  const sponsorImage =
    entry.externalSponsor?.sponsorImageUrl || entry.promotedToken?.iconUrl;
  const sponsorDescription =
    entry.externalSponsor?.description || entry.promotedToken?.description;
  const sponsorWebsite =
    entry.externalSponsor?.websiteUrl || entry.promotedToken?.websiteUrl;
  const sponsorTwitter = entry.externalSponsor?.twitterHandle;

  const formattedBurnValue = entry.totalUsdBurnValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
      className={cn(
        "flex flex-col gap-4 p-4 rounded-xl border transition-all hover:shadow-md",
        getRankBgColor(entry.rank),
      )}>
      {/* Header with rank and sponsor info */}
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div
          className={cn(
            "flex items-center justify-center size-10 rounded-full shrink-0",
            entry.rank <= 3 ? getRankBgColor(entry.rank) : "bg-muted",
          )}>
          {entry.rank <= 3 ? (
            <Trophy className={cn("size-5", getRankColor(entry.rank))} />
          ) : (
            <span className="text-sm font-bold text-muted-foreground">
              #{entry.rank}
            </span>
          )}
        </div>

        {/* Sponsor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {sponsorImage && (
              <div className="relative size-12 rounded-lg overflow-hidden shrink-0 border border-muted">
                <Image
                  src={sponsorImage}
                  alt={sponsorName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{sponsorName}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {entry.sponsorType} sponsor
              </p>
            </div>
          </div>
        </div>

        {/* Burn Value */}
        <div className="text-right shrink-0">
          <p className="font-bold text-lg text-orange-500">
            {formattedBurnValue}
          </p>
          <p className="text-xs text-muted-foreground">
            {entry.burnCount} burn{entry.burnCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Description */}
      {sponsorDescription && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {sponsorDescription}
        </p>
      )}

      {/* Advertising Message */}
      {entry.advertisingMetadata?.message && (
        <div className="bg-orange-500/10 rounded-lg px-3 py-2">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
            {entry.advertisingMetadata.message}
          </p>
        </div>
      )}

      {/* Footer with links */}
      <div className="flex items-center gap-3 pt-2 border-t border-muted">
        {sponsorWebsite && (
          <Link
            href={sponsorWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="size-3.5" />
            Website
          </Link>
        )}
        {sponsorTwitter && (
          <Link
            href={
              sponsorTwitter.startsWith("http")
                ? sponsorTwitter
                : `https://x.com/${sponsorTwitter}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Image
              src="/socials/x_logo_white.svg"
              alt="X"
              width={12}
              height={12}
              className="opacity-60"
            />
            {sponsorTwitter.replace("https://x.com/", "@")}
          </Link>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          Last burn: {new Date(entry.lastBurnAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};
