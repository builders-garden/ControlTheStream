"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ToastNotification } from "@/components/custom-ui/toast/toast-notification";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { Brand } from "@/lib/database/db.schema";
import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";
import {
  TipReceivedEvent,
  TokenTradedEvent,
  VoteReceivedEvent,
} from "@/lib/types/socket";

export const OverlayPopups = ({ brand }: { brand: Brand }) => {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();

  const showPopupCallback = useCallback(
    (
      data: {
        username: string;
        profilePicture: string;
        text?: string;
        position: PopupPositions;
        customMessage?: string;
      },
      duration?: number,
    ) => {
      toast.custom(
        () => (
          <ToastNotification
            data={data}
            slideOffset={100}
            brandSlug={brand.slug}
          />
        ),
        {
          duration: duration || 2000,
          position: PopupPositions.TOP_CENTER,
        },
      );
    },
    [],
  );

  useEffect(() => {
    // Join the stream
    joinStream({
      brandId: brand.id,
      username: "Overlay",
      profilePicture: "https://via.placeholder.com/150",
    });

    // Create event handlers
    const handleTipReceived = (data: TipReceivedEvent) => {
      showPopupCallback(
        {
          username: data.username,
          profilePicture: data.profilePicture,
          text: `sent a $${data.tipAmount} tip`,
          position: data.position,
          customMessage: data.customMessage,
        },
        data.customMessage ? 7500 : 2000,
      );
    };

    const handleTokenTraded = (data: TokenTradedEvent) => {
      showPopupCallback({
        username: data.username,
        profilePicture: data.profilePicture,
        text: `bought some $${data.tokenOutName}`,
        position: data.position,
      });
    };

    const handleVoteReceived = (data: VoteReceivedEvent) => {
      showPopupCallback({
        username: data.username,
        profilePicture: data.profilePicture,
        text: `${data.isBull ? "is bullish" : "is bearish"}`,
        position: data.position,
      });
    };

    // Set up subscriptions
    subscribe(ServerToClientSocketEvents.TIP_RECEIVED, handleTipReceived);
    subscribe(ServerToClientSocketEvents.TOKEN_TRADED, handleTokenTraded);
    subscribe(ServerToClientSocketEvents.VOTE_RECEIVED, handleVoteReceived);

    // Cleanup subscriptions
    return () => {
      unsubscribe(ServerToClientSocketEvents.TIP_RECEIVED, handleTipReceived);
      unsubscribe(ServerToClientSocketEvents.TOKEN_TRADED, handleTokenTraded);
      unsubscribe(ServerToClientSocketEvents.VOTE_RECEIVED, handleVoteReceived);
    };
  }, [subscribe, unsubscribe, joinStream, showPopupCallback, brand]);

  return (
    <div className="flex h-screen w-[100vw]">
      <div className="flex h-full w-full"> </div>
    </div>
  );
};
