"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ToastPollNotification } from "@/components/custom-ui/toast/toast-poll-notification";
import { useActiveBullMeter } from "@/hooks/use-bull-meters";
import { useSentimentPollSocket } from "@/hooks/use-sentiment-poll-socket";
import { Brand } from "@/lib/database/db.schema";
import { PopupPositions } from "@/lib/enums";
import {
  EndPollNotificationEvent,
  PollNotificationEvent,
  UpdatePollNotificationEvent,
} from "@/lib/types/socket";
import { env } from "@/lib/zod";

export const OverlaySentiment = ({ brand }: { brand: Brand }) => {
  const { data: activeBullMeter, isLoading: isLoadingActiveBullMeter } =
    useActiveBullMeter(brand.id);

  // Unified poll state and visibility flag
  type NormalizedPoll = {
    id: string;
    prompt: string;
    pollId?: string;
    deadlineSeconds: number | null;
    votes?: number;
    voters?: number;
    results?: { bullPercent: number; bearPercent: number };
  };
  const [_poll, setPoll] = useState<NormalizedPoll | null>(null);
  const [_showPoll, setShowPoll] = useState<boolean>(false);

  const toastId = useMemo(() => `sentiment-poll-${brand.id}`, [brand]);

  const openToastFromPoll = useCallback(
    (poll: NormalizedPoll) => {
      toast.custom(
        () => (
          <ToastPollNotification
            brandSlug={brand.slug}
            data={{
              id: poll.id,
              brandId: brand.id,
              pollQuestion: poll.prompt,
              endTimeMs: (poll.deadlineSeconds || 180) * 1000,
              votes: poll.votes || 0,
              voters: poll.voters || 0,
              qrCodeUrl: `cbwallet://miniapp?url=${env.NEXT_PUBLIC_URL}/${brand.slug}`,
              position: PopupPositions.TOP_CENTER,
              results: poll.results || { bullPercent: 0, bearPercent: 0 },
            }}
          />
        ),
        {
          id: toastId,
          duration: Infinity,
          position: PopupPositions.TOP_CENTER,
          className: "flex items-center justify-center w-full",
        },
      );
    },
    [toastId],
  );

  useEffect(() => {
    if (isLoadingActiveBullMeter) return;
    if (activeBullMeter?.data) {
      const totalVotes =
        (activeBullMeter.data.totalNoVotes || 0) +
        (activeBullMeter.data.totalYesVotes || 0);

      const normalized: NormalizedPoll = {
        id: activeBullMeter.data.id,
        prompt: activeBullMeter.data.prompt,
        pollId: activeBullMeter.data.pollId,
        deadlineSeconds: activeBullMeter.data.deadline || null,
        votes: totalVotes,
        voters: undefined,
        results: {
          bullPercent: activeBullMeter.data.totalYesVotes || 0,
          bearPercent: activeBullMeter.data.totalNoVotes || 0,
        },
      };
      setPoll((prev) => {
        if (
          prev &&
          prev.id === normalized.id &&
          prev.votes === normalized.votes &&
          prev.deadlineSeconds === normalized.deadlineSeconds &&
          prev.results?.bullPercent === normalized.results?.bullPercent &&
          prev.results?.bearPercent === normalized.results?.bearPercent
        ) {
          return prev;
        }
        return normalized;
      });
      setShowPoll(true);
      openToastFromPoll(normalized);
    } else {
      setShowPoll(false);
      setPoll(null);
      toast.dismiss(toastId);
    }
  }, [activeBullMeter, isLoadingActiveBullMeter, openToastFromPoll, toastId]);

  useSentimentPollSocket({
    joinInfo: {
      brandId: brand.id,
      username: "Overlay",
      profilePicture: "https://via.placeholder.com/150",
    },
    onStart: (data: PollNotificationEvent) => {
      const normalized: NormalizedPoll = {
        id: data.id,
        prompt: data.pollQuestion,
        pollId: data.qrCodeUrl,
        deadlineSeconds: Math.floor(data.endTimeMs / 1000),
        votes: data.votes,
        voters: data.voters,
        results: data.results,
      };
      setPoll(normalized);
      setShowPoll(true);
      openToastFromPoll(normalized);
    },
    onUpdate: (data: UpdatePollNotificationEvent) => {
      const absoluteDeadline = data.endTimeMs
        ? Math.floor(data.endTimeMs / 1000)
        : null;
      setPoll((prev) => {
        if (!prev) return prev;
        const updated: NormalizedPoll = {
          ...prev,
          id: data.id,
          votes: data.votes,
          voters: data.voters,
          results: data.results,
          deadlineSeconds: absoluteDeadline,
        };
        openToastFromPoll(updated);
        return updated;
      });
      setShowPoll(true);
    },
    onEnd: (data: EndPollNotificationEvent) => {
      const absoluteDeadline = data.endTimeMs
        ? Math.floor(data.endTimeMs / 1000)
        : null;
      setPoll((prev) => {
        const updated: NormalizedPoll = {
          id: data.id,
          prompt: prev?.prompt || "",
          pollId: prev?.pollId,
          deadlineSeconds: absoluteDeadline,
          votes: data.votes,
          voters: data.voters,
          results: data.results,
        };
        openToastFromPoll(updated);
        return updated;
      });
      setShowPoll(true);
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 45000);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-[130px] w-[1000px]">
      <div className="flex h-full w-full"> </div>
    </div>
  );
};
