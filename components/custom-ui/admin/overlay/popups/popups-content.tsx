import { addSeconds } from "date-fns";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/custom-ui/copy-button";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { ToastKalshiNotification } from "@/components/custom-ui/toast/toast-kalshi-notification";
import { ToastNotification } from "@/components/custom-ui/toast/toast-notification";
import { ToastPollNotification } from "@/components/custom-ui/toast/toast-poll-notification";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import {
  KALSHI_TESTING_EVENT_ID_MULTIPLE,
  KALSHI_TESTING_EVENT_ID_SINGLE,
  KALSHI_TESTING_URL_MULTIPLE,
  KALSHI_TESTING_URL_SINGLE,
  THE_ROLLUP_BRAND_SLUG,
} from "@/lib/constants";
import { PopupPositions } from "@/lib/enums";
import { env } from "@/lib/zod";

export const PopupsContent = () => {
  const { brand } = useAdminAuth();
  useSocket();
  const {
    joinStream,
    tipSent,
    tokenTraded,
    voteCasted,
    adminStartBullmeter: adminStartSentimentPoll,
    adminEndBullmeter: adminEndSentimentPoll,
    adminStartKalshiMarket,
  } = useSocketUtils();
  const [selectedPopupPosition, _] = useState<PopupPositions>(
    PopupPositions.TOP_CENTER,
  );

  const handleTestNotification = (
    type: "tip" | "tip-message" | "trade" | "vote",
  ) => {
    if (!brand.data?.id) return;
    const testData = {
      username: "test.base.eth",
      profilePicture: "https://picsum.photos/200",
      text:
        type === "tip" || type === "tip-message"
          ? "sent a $5 tip"
          : type === "trade"
            ? "bought some $HIGHER"
            : Math.random() > 0.5
              ? "is bullish"
              : "is bearish",
      customMessage:
        type === "tip-message"
          ? "This is a custom message of 41 characters"
          : "",
    };
    const isRightSide =
      selectedPopupPosition === PopupPositions.TOP_RIGHT ||
      selectedPopupPosition === PopupPositions.BOTTOM_RIGHT;
    const slideOffset = isRightSide ? 100 : -100;

    toast.custom(
      () => (
        <ToastNotification
          data={testData}
          slideOffset={slideOffset}
          brandSlug={brand.data?.slug ?? THE_ROLLUP_BRAND_SLUG}
        />
      ),
      {
        duration: type === "tip-message" ? 7500 : 2000,
        position: selectedPopupPosition,
      },
    );
    if (type === "tip") {
      tipSent({
        brandId: brand.data.id,
        position: selectedPopupPosition,
        username: testData.username,
        profilePicture: testData.profilePicture,
        tipAmount: "5",
        customMessage: "",
      });
    } else if (type === "tip-message") {
      tipSent({
        brandId: brand.data.id,
        position: selectedPopupPosition,
        username: testData.username,
        profilePicture: testData.profilePicture,
        tipAmount: "5",
        customMessage: "Test custom message",
      });
    } else if (type === "trade") {
      tokenTraded({
        brandId: brand.data.id,
        position: selectedPopupPosition,
        username: testData.username,
        profilePicture: testData.profilePicture,
        tokenInAmount: "5",
        tokenInName: "ETH",
        tokenInDecimals: 18,
        tokenInImageUrl: "https://via.placeholder.com/150",
        tokenOutAmount: "100",
        tokenOutDecimals: 18,
        tokenOutName: "ETH",
        tokenOutImageUrl: "https://via.placeholder.com/150",
      });
    } else if (type === "vote") {
      voteCasted({
        brandId: brand.data.id,
        position: selectedPopupPosition,
        username: testData.username,
        profilePicture: testData.profilePicture,
        voteAmount: "5",
        isBull: true,
        promptId: "1",
        endTimeMs: addSeconds(new Date(), 5).getTime(),
      });
    }
  };

  const handleTestPollNotification = () => {
    if (!brand.data?.id) return;

    const data = {
      id: "1",
      brandId: brand.data.id,
      pollQuestion: "ETH will flip BTC this cycle",
      endTimeMs: addSeconds(new Date(), 8).getTime(),
      votes: 10,
      voters: 10,
      qrCodeUrl: "https://example.com/poll",
      position: selectedPopupPosition,
      results: {
        bullPercent: 70,
        bearPercent: 30,
      },
    };

    adminStartSentimentPoll({
      id: "1",
      brandId: brand.data.id,
      pollQuestion: "ETH will flip BTC this cycle",
      endTimeMs: addSeconds(new Date(), 8).getTime(),
      position: selectedPopupPosition,
      guests: [],
      results: {
        bullPercent: 70,
        bearPercent: 30,
      },
    });

    const durationMs = 15000;

    // Set timeout to end poll after duration (so overlay receives END event)
    setTimeout(() => {
      if (!brand.data?.id) return;
      adminEndSentimentPoll({
        id: "1",
        brandId: brand.data.id,
        votes: 0,
        voters: 0,
        results: { bullPercent: 0, bearPercent: 0 },
      });
    }, durationMs);

    toast.custom(
      () => (
        <ToastPollNotification
          data={data}
          brandSlug={brand.data?.slug ?? THE_ROLLUP_BRAND_SLUG}
        />
      ),
      {
        duration: durationMs,
        position: selectedPopupPosition,
        onDismiss: () => {
          if (!brand.data?.id) return;
          adminEndSentimentPoll({
            id: "1",
            brandId: brand.data.id,
            votes: 0,
            voters: 0,
            results: { bullPercent: 0, bearPercent: 0 },
          });
        },
      },
    );
  };

  // A single function to test both single and multiple Kalshi notifications
  const handleTestKalshiNotification = (single: boolean) => {
    if (!brand.data?.id) return;
    const durationMs = 20000;

    const dataId = single
      ? "test-kalshi-single-" + Date.now()
      : "test-kalshi-multiple-" + Date.now();
    const kalshiUrl = single
      ? KALSHI_TESTING_URL_SINGLE
      : KALSHI_TESTING_URL_MULTIPLE;
    const kalshiEventId = single
      ? KALSHI_TESTING_EVENT_ID_SINGLE
      : KALSHI_TESTING_EVENT_ID_MULTIPLE;

    const data = {
      id: dataId,
      brandId: brand.data.id,
      kalshiUrl: kalshiUrl,
      kalshiEventId: kalshiEventId,
      position: selectedPopupPosition,
    };

    // Emit socket event so overlay can receive it
    adminStartKalshiMarket({
      id: data.id,
      brandId: data.brandId,
      kalshiUrl: data.kalshiUrl,
      kalshiEventId: data.kalshiEventId,
      position: data.position,
      durationMs,
    });

    // Also show toast in admin panel
    toast.custom(
      () => (
        <ToastKalshiNotification
          data={data}
          brandSlug={brand.data?.slug ?? THE_ROLLUP_BRAND_SLUG}
        />
      ),
      {
        duration: durationMs,
        position: selectedPopupPosition,
      },
    );
  };

  useEffect(() => {
    if (!brand.data?.id) return;
    joinStream({
      brandId: brand.data.id,
      username: "Admin",
      profilePicture: "https://via.placeholder.com/150",
    });
  }, [joinStream]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-16">
      <div className="flex flex-col justify-start items-start w-full h-fit gap-5">
        <h1 className="font-bold text-2xl">
          Display animated popups on stream whenever viewers tip, trade, or vote
        </h1>
        <div className="flex flex-col justify-start items-start w-full h-full gap-5">
          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-start items-start w-full gap-10">
            <div className="flex flex-col justify-center items-start w-[70%] gap-2.5">
              <p className="text-base font-bold text-muted-foreground">
                Test popups by clicking the buttons below
              </p>
              <div className="grid grid-cols-7 gap-2.5 w-full">
                <CTSButton
                  className="w-full shrink-0"
                  onClick={() => handleTestNotification("tip")}>
                  Tip
                </CTSButton>
                <CTSButton
                  className="w-full shrink-0"
                  onClick={() => handleTestNotification("tip-message")}>
                  Tip with message
                </CTSButton>
                <CTSButton
                  className="w-full shrink-0"
                  onClick={() => handleTestNotification("trade")}>
                  Trade
                </CTSButton>
                <CTSButton
                  className="w-full shrink-0"
                  onClick={() => handleTestNotification("vote")}>
                  Vote
                </CTSButton>
                <CTSButton
                  className="w-full shrink-0"
                  onClick={handleTestPollNotification}>
                  Bull-Meter Poll
                </CTSButton>
                <CTSButton
                  className="w-full shrink-0"
                  onClick={() => handleTestKalshiNotification(true)}>
                  Kalshi Market (single)
                </CTSButton>
                <CTSButton
                  className="w-full shrink-0"
                  onClick={() => handleTestKalshiNotification(false)}>
                  Kalshi Market (multiple)
                </CTSButton>
              </div>
            </div>
          </div>
          {/* Note: Toasts render at the viewport edge using Sonner. Use buttons above to test. */}
        </div>
      </div>
      <div className="flex flex-col justify-start items-start w-full h-full gap-5">
        <h1 className="font-bold text-2xl">
          How to setup the Overlay on your stream?
        </h1>
        <div className="flex flex-col justify-start items-start w-full h-full gap-8">
          <div className="flex flex-col justify-start items-start gap-1">
            <p className="text-muted-foreground font-bold">
              <span className="font-bold">1.</span> Copy the URLs below and add
              Browser Sources to your setup
            </p>
            <div className="flex flex-col justify-start items-start w-full gap-2.5">
              <div className="flex justify-start items-start w-full gap-2.5">
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-muted/70 text-sm">Popups URL</p>
                  <div className="flex justify-between items-center w-full gap-2.5 border border-muted rounded-md p-2">
                    {`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}/overlay/popups`}
                    <CopyButton
                      key="copy-button-popups"
                      size="sm"
                      stringToCopy={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}/overlay/popups`}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-muted/70 text-sm">
                    Bull-meter Poll URL
                  </p>
                  <div className="flex justify-between items-center w-full gap-2.5 border border-muted rounded-md p-2">
                    {`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}/overlay/sentiment`}
                    <CopyButton
                      key="copy-button-sentiment"
                      size="sm"
                      stringToCopy={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}/overlay/sentiment`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-start items-start w-full gap-2.5">
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-muted/70 text-sm">
                    Kalshi Market URL
                  </p>
                  <div className="flex justify-between items-center w-full gap-2.5 border border-muted rounded-md p-2">
                    {`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}/overlay/kalshi`}
                    <CopyButton
                      key="copy-button-kalshi"
                      size="sm"
                      stringToCopy={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}/overlay/kalshi`}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-muted/70 text-sm">
                    Pyro Sponsor URL
                  </p>
                  <div className="flex justify-between items-center w-full gap-2.5 border border-muted rounded-md p-2">
                    {`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}/overlay/pyro`}
                    <CopyButton
                      key="copy-button-pyro"
                      size="sm"
                      stringToCopy={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}/overlay/pyro`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-1">
            <p className="text-muted-foreground font-bold">
              <span className="font-bold">2.</span> Set width and height to
              600x150 for popups, 1100x250 for bull-meter poll, 1100x250 for
              Kalshi market, and 600x150 for Pyro sponsor
            </p>
            <p className="text-sm text-muted/70">
              These are suggested sizes, feel free to adjust them to your
              liking.
            </p>
          </div>
          <div className="flex flex-col justify-start items-start gap-1">
            <p className="text-muted-foreground font-bold">
              <span className="font-bold">3.</span> Position the source at the
              top of your Sources list
            </p>
          </div>
          <div className="flex flex-col justify-start items-start gap-1">
            <p className="text-muted-foreground font-bold">
              <span className="font-bold">4.</span> For testing purposes, click
              the test buttons above and check the popups appear correctly on
              your stream
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
