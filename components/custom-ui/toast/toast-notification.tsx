"use client";

import { AnimatePresence, easeIn, easeOut, motion } from "motion/react";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface NotificationData {
  id?: string;
  username: string;
  profilePicture: string;
  text?: string;
  customMessage?: string;
}

export const ToastNotification = ({
  data,
  slideOffset = 0,
  brandSlug,
}: {
  data: NotificationData;
  slideOffset?: number;
  brandSlug: string;
}) => {
  // Whether the brand is the Rollup
  const isBrandTheRollup = brandSlug === THE_ROLLUP_BRAND_SLUG;

  // Whether the text contains "bullish" or "bearish"
  const textContainsBullish = data.text?.includes("bullish");
  const textContainsBearish = data.text?.includes("bearish");

  const motionProps = {
    initial: { opacity: 0, x: slideOffset, scale: 0.95 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: easeOut,
        opacity: { duration: 0.1 },
        scale: {
          duration: 0.2,
          ease: "circOut",
        },
      },
    },
    exit: {
      opacity: 0,
      x: -slideOffset,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: easeIn,
      },
    },
  } as const;

  if (data.customMessage) {
    return (
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          {...motionProps}
          className={cn(
            "rounded-3xl shadow-lg p-4 flex flex-col justify-center items-center gap-3 min-w-[500px] border-8 font-overused-grotesk cursor-default",
            isBrandTheRollup
              ? "border-[#E6B45E] bg-[#1B2541]"
              : "border-primary bg-background",
          )}>
          <div className="flex justify-start items-center gap-3 w-full">
            <img
              src={data.profilePicture}
              alt={data.username}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <div
              className="flex justify-start items-center gap-2 overflow-hidden w-full"
              style={{
                color: "white !important",
              }}>
              <p className="text-lg font-medium truncate">
                {data.username}{" "}
                {data.text && (
                  <span className="shrink-0 font-normal pr-1 italic">
                    {data.text}
                  </span>
                )}
              </p>
            </div>
          </div>

          {data.customMessage && (
            <div
              className="flex justify-center items-center gap-3 w-full"
              style={{
                color: "white !important",
              }}>
              <p className="text-2xl font-medium">
                &quot;{data.customMessage}&quot;
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  } else {
    return (
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          {...motionProps}
          className={cn(
            "rounded-3xl shadow-lg p-4 flex justify-start items-center gap-3 min-w-[500px] border-8 font-overused-grotesk cursor-default",
            isBrandTheRollup
              ? "border-[#E6B45E] bg-[#1B2541]"
              : "border-primary bg-background",
          )}>
          <img
            src={data.profilePicture}
            alt={data.username}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            <p
              className="w-full flex gap-1 text-2xl font-medium"
              style={{
                color: "white !important",
              }}>
              <span className="truncate">{data.username}</span>
              {data.text &&
                (textContainsBullish ? (
                  <p className="shrink-0 font-bold">
                    is{" "}
                    <span
                      style={{
                        color: "green",
                      }}>
                      bullish
                    </span>
                  </p>
                ) : textContainsBearish ? (
                  <p className="shrink-0 font-bold">
                    is{" "}
                    <span
                      style={{
                        color: "red",
                      }}>
                      bearish
                    </span>
                  </p>
                ) : (
                  <p className="shrink-0 font-bold">{data.text}</p>
                ))}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
};
