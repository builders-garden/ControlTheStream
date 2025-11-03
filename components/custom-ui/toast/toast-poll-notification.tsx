"use client";

import ky from "ky";
import { Loader2 } from "lucide-react";
import { AnimatePresence, easeIn, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/shadcn-ui/number-ticker";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { useTimer } from "@/hooks/use-timer";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { ServerToClientSocketEvents } from "@/lib/enums";
import { UpdatePollNotificationEvent } from "@/lib/types/socket";
import { cn } from "@/lib/utils";
import { BearIcon } from "../icons/bear-icon";
import { BullIcon } from "../icons/bull-icon";

export interface PollNotificationData {
  id: string;
  brandId: string;
  pollQuestion: string;
  endTimeMs: number;
  votes: number;
  voters: number;
  qrCodeUrl: string;
  position: string;
  results?: {
    bullPercent: number;
    bearPercent: number;
  };
}

const formatSecondsToClock = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(1, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const ResultsBar = ({
  bearPercent,
  bullPercent,
  brandSlug,
}: {
  bearPercent: number;
  bullPercent: number;
  brandSlug: string;
}) => {
  // Whether the brand is the Rollup
  const isBrandTheRollup = brandSlug === THE_ROLLUP_BRAND_SLUG;

  const clampedBear = Math.max(0, Math.min(100, bearPercent));
  const clampedBull = Math.max(0, Math.min(100, bullPercent));
  const total = clampedBear + clampedBull;
  const normalizedBear = total === 0 ? 50 : (clampedBear / total) * 100;
  const normalizedBull = 100 - normalizedBear;

  return (
    <motion.div
      className={cn(
        "flex items-center w-full min-w-[1000px] rounded-xl overflow-hidden border-4",
        isBrandTheRollup ? "border-[#E6B45E]" : "border-white",
      )}
      initial={{ opacity: 0, scale: 0, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        rotate: { type: "spring", visualDuration: 0.45, bounce: 0.3 },
      }}>
      <motion.div
        className={cn(
          // TODO: add 85%  transparency on BG
          "h-14 flex items-center justify-center bg-[#CF5953]",
          normalizedBear > 0 ? "px-4" : "px-0",
        )}
        initial={{ width: "50%" }}
        animate={{ width: `${normalizedBear}%` }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 60,
          delay: 0.45,
        }}>
        <span className="flex items-center gap-2 text-foreground font-overused-grotesk font-black text-2xl">
          <BearIcon className="w-8 h-8" />{" "}
          <NumberTicker
            value={normalizedBear}
            startValue={50}
            className="whitespace-pre-wrap text-foreground font-overused-grotesk font-black text-2xl tracking-tighter shrink-0"
            delay={0.45}
          />
          %
        </span>
      </motion.div>
      <motion.div
        className={cn(
          // TODO: add 85%  transparency on BG
          "h-14 flex items-center justify-center bg-[#4CAF50]",
          normalizedBull > 0 ? "px-4" : "px-0",
        )}
        initial={{ width: "50%" }}
        animate={{ width: `${normalizedBull}%` }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 60,
          delay: 0.45,
        }}>
        <span className="flex items-center gap-2 text-foreground font-overused-grotesk font-black text-2xl">
          <BullIcon className="w-8 h-8 fill-white" />{" "}
          <NumberTicker
            value={normalizedBull}
            startValue={50}
            className="whitespace-pre-wrap text-foreground font-overused-grotesk font-black text-2xl tracking-tighter shrink-0"
            delay={0.45}
          />
          %
        </span>
      </motion.div>
    </motion.div>
  );
};

export const ToastPollNotification = ({
  data,
  brandSlug,
}: {
  data: PollNotificationData;
  brandSlug: string;
}) => {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();
  const [_, setVoters] = useState<number>(data.voters);
  const [votes, setVotes] = useState<number>(data.votes);
  const [results, setResults] = useState<{
    bullPercent: number;
    bearPercent: number;
  }>(data.results || { bullPercent: 0, bearPercent: 0 });

  // Whether the brand is the Rollup
  const isBrandTheRollup = brandSlug === THE_ROLLUP_BRAND_SLUG;

  // Create event handlers
  const handleUpdateSentimentPoll = (data: UpdatePollNotificationEvent) => {
    setVoters(data.voters);
    setVotes(data.votes);
    if (data.results) {
      setResults(data.results);
    }
  };

  useEffect(() => {
    // Join the stream
    joinStream({
      brandId: data.brandId,
      username: "Poll",
      profilePicture: "https://via.placeholder.com/150",
    });
    subscribe(
      ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL,
      handleUpdateSentimentPoll,
    );

    return () => {
      unsubscribe(
        ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL,
        handleUpdateSentimentPoll,
      );
    };
  }, []);

  // Compute directional offsets based on toast position
  const isLeft = data.position?.includes("left");
  const isRight = data.position?.includes("right");
  const isCenter = data.position?.includes("center");
  const isTop = data.position?.startsWith("top");
  const xOffset = isLeft ? 100 : isRight ? -100 : 0;
  const yOffset = isCenter ? (isTop ? 100 : -100) : 0;

  const [isFetchingCurrentTime, setIsFetchingCurrentTime] =
    useState<boolean>(false);
  const { remainingSeconds, startTimer } = useTimer({});

  // On load, call an api to get the current time
  useEffect(() => {
    const fetchCurrentTime = async () => {
      setIsFetchingCurrentTime(true);
      try {
        const res = await ky
          .get<{
            timestamp: number; // already unix time in milliseconds
          }>("/api/current-time", {
            timeout: false,
          })
          .json();
        const secondsToSet = Math.max(
          0,
          Math.ceil((data.endTimeMs - res.timestamp) / 1000),
        );
        startTimer(secondsToSet);
      } catch (err) {
        console.error("Failed to fetch timestamp:", err);
        startTimer(180); // fallback to 3 minutes
      } finally {
        setIsFetchingCurrentTime(false);
      }
    };

    fetchCurrentTime();
  }, []);

  const isVotingClosed = remainingSeconds <= 0;
  const timeLabel = isVotingClosed
    ? "Vote ended"
    : `${formatSecondsToClock(remainingSeconds)} left to vote`;

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
            rotate: { times: [0, 0.6, 1], duration: 0.9 },
          },
        }}
        exit={{
          opacity: 0,
          x: xOffset ? -xOffset : 0,
          y: yOffset ? -yOffset : 50,
          scale: 0.8,
          transition: { duration: 0.4, ease: easeIn },
        }}
        className="flex flex-col gap-1 font-overused-grotesk w-full">
        {isVotingClosed && results && !isFetchingCurrentTime ? (
          <ResultsBar
            bearPercent={results.bearPercent}
            bullPercent={results.bullPercent}
            brandSlug={brandSlug}
          />
        ) : null}

        <div
          className={cn(
            "rounded-xl shadow-lg px-6 flex items-center justify-between gap-6 min-w-[1000px] min-h-[100px] border-4 font-grotesk text-foreground",
            isBrandTheRollup
              ? "bg-gradient-to-b bg-[#1B2541] border-[#E6B45E]"
              : "border-primary bg-background",
          )}>
          <div className="flex items-center gap-2 text-xl shrink-0">
            <BullIcon className="w-[34px] h-[34px] fill-[#4CAF50]" />
            <p className="shrink-0">or</p>
            <BearIcon className="w-[34px] h-[34px] fill-[#CF5953]" />
          </div>
          <span className="text-[27px] font-black leading-8">
            {data.pollQuestion}
          </span>
          <div className="flex justify-center items-center shrink-0 w-[31%]">
            <AnimatePresence mode="wait">
              {isFetchingCurrentTime ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="flex justify-center items-center w-full">
                  <Loader2 className="size-6 text-foreground animate-spin" />
                </motion.div>
              ) : (
                <motion.div className="flex flex-col items-center justify-center gap-0 w-full">
                  <span
                    className={cn(
                      "font-bold text-[22px] text-center",
                      isBrandTheRollup ? "text-[#E6B45E]" : "text-primary",
                    )}>
                    {timeLabel}
                  </span>
                  <span
                    className={cn(
                      "text-base",
                      isBrandTheRollup
                        ? "text-gray-400"
                        : "text-muted-foreground",
                    )}>
                    {votes.toString()} votes
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="bg-white p-1">
              <QRCodeSVG value={data.qrCodeUrl} size={66} level="M" />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
