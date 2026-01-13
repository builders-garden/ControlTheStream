import { useAppKit } from "@reown/appkit/react";
import { Loader2, LogOut, Sparkles, User, Heart, Flame } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import { useLastYoutubeContent } from "@/hooks/use-last-youtube-content";
import { usePyroCreatorExists } from "@/hooks/use-pyro-creator-exists";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { cn, formatWalletAddress } from "@/lib/utils";
import { env } from "@/lib/zod";
import { WebAppCreatorCoin } from "@/plugins/web-app/creator-coin/web-app-creator-coin";
import { WebAppFeaturedTokens } from "@/plugins/web-app/featured-tokens/web-app-featured-tokens";
import { WebAppPyroSponsor } from "@/plugins/web-app/pyro-sponsor/web-app-pyro-sponsor";
import { WebAppTips } from "@/plugins/web-app/tips/web-app-tips";
import { CTSButton } from "../custom-ui/cts-button";
import { CTSCard } from "../custom-ui/cts-card";
import { LogoutButton } from "../custom-ui/logout-button";
import { ShareButton } from "../custom-ui/share-button";
import { TheRollupButton } from "../custom-ui/tr-button";
import { WebAppAboutSection } from "../custom-ui/web-app/web-app-about-section";
import { WebAppPollCard } from "../custom-ui/web-app/web-app-poll-card";
import { ScrollArea } from "../shadcn-ui/scroll-area";
import { Separator } from "../shadcn-ui/separator";
import { Skeleton } from "../shadcn-ui/skeleton";

export const WebAppStreamPage = () => {
  const {
    brand,
    user,
    signInWithWebApp,
    isSigningIn,
    executeLogout,
    isLoggingOut,
    sideBarLoading,
    isLoading,
  } = useWebAppAuth();
  const { address: connectedAddress } = useAccount();
  const { open } = useAppKit();

  // This state memorizes if the user was not connected before the page loaded
  const [wasNotConnected, setWasNotConnected] = useState(!connectedAddress);

  // TEMP: Toggle between Tip and Sponsor with Oyto
  const [activeTab, setActiveTab] = useState<"tip" | "sponsor">("tip");

  // Get the last youtube content for this brand
  const { data: lastYoutubeContent, isLoading: isLastYoutubeContentLoading } =
    useLastYoutubeContent(brand.data?.slug || "");

  // Check if the creator exists on Pyro
  const { data: pyroCreatorExists } = usePyroCreatorExists({
    // mint: brand.data?.pyroMint,
        mint: "0xfaac6a5816f2734f231119c2cf0b16227ee83328",

  });
  // If the user was not connected before the page loaded
  // Automatically start the sign in process
  useEffect(() => {
    if (
      connectedAddress &&
      wasNotConnected &&
      !isSigningIn &&
      !isLoggingOut &&
      !sideBarLoading &&
      !isLoading
    ) {
      signInWithWebApp();
      setWasNotConnected(false);
    }
  }, [connectedAddress]);

  // Handles the logout
  const handleLogout = () => {
    executeLogout();
    setWasNotConnected(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col md:flex-row justify-between items-center min-h-screen w-full">
      {/* Video and info area - scrollable vertically */}
      <ScrollArea
        scrollBarClassName="w-0"
        className="w-full md:w-auto md:flex-1">
        <div className="flex flex-col justify-start items-center min-h-screen md:h-screen w-full p-4 md:p-6 gap-4 md:gap-5">
          {/* Video */}
          <div className="flex justify-center items-center w-full aspect-video bg-black/10 rounded-[8px] overflow-hidden">
            <AnimatePresence mode="wait">
              {isLastYoutubeContentLoading ? (
                <motion.div
                  key="youtube-stream-video-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex justify-center items-center w-full h-full">
                  <Loader2
                    className={cn(
                      "size-10 text-foreground animate-spin",
                      brand.data?.slug === THE_ROLLUP_BRAND_SLUG &&
                        "text-black",
                    )}
                  />
                </motion.div>
              ) : lastYoutubeContent?.data?.url ? (
                <motion.div
                  key="youtube-stream-video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="size-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src={lastYoutubeContent.data.url}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="youtube-stream-video-not-found"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex justify-center items-center size-full">
                  <p className="text-lg font-bold text-center">
                    No Livestream found
                    <br />
                    try again later!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info */}
          <AnimatePresence mode="wait">
            {isLastYoutubeContentLoading ? (
              <motion.div
                key="youtube-stream-info-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex justify-center items-center w-full flex-1">
                <Skeleton className="w-full h-full bg-black/10" />
              </motion.div>
            ) : (
              <motion.div
                key="youtube-stream-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col justify-start items-center w-full gap-4 md:gap-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3 md:gap-0 px-2 md:px-5">
                  <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-3 sm:gap-5 w-full md:w-auto">
                    <div className="relative flex justify-center items-center bg-black/10 rounded-full shrink-0">
                      {brand.data?.logoUrl ? (
                        <Image
                          src={brand.data?.logoUrl}
                          alt={brand.data?.name || ""}
                          width={86}
                          height={86}
                          className="rounded-full object-cover shrink-0 size-16 sm:size-[86px]"
                        />
                      ) : (
                        <div className="flex justify-center items-center size-16 sm:size-[86px] bg-black/10 rounded-full">
                          <p className="text-3xl sm:text-5xl font-bold text-center text-black/60">
                            {brand.data?.name?.slice(0, 1).toUpperCase() || ""}
                          </p>
                        </div>
                      )}
                      {lastYoutubeContent?.data?.isLive && (
                        <div className="absolute bottom-0 left-0 right-0 top-0 size-16 sm:size-[86px] border-3 border-destructive rounded-full" />
                      )}
                      {lastYoutubeContent?.data?.isLive && (
                        <div className="absolute flex justify-center items-center -bottom-1 left-1/2 transform -translate-x-1/2 bg-destructive rounded-sm w-fit px-2 py-[1px]">
                          <p className="text-sm sm:text-base text-foreground font-bold">
                            LIVE
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center items-start gap-1 h-full flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                        {lastYoutubeContent?.data?.title || ""}
                      </h1>
                      <p className="text-base sm:text-lg text-gray-500">
                        by {brand.data?.name}
                      </p>
                    </div>
                  </div>

                  {/* Share button */}
                  <div className="self-end md:self-auto">
                    <ShareButton
                      copyLinkText={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}`}
                      buttonClassName="shrink-1 w-min cursor-pointer"
                      buttonSize="lg"
                      brandName={brand.data?.name}
                    />
                  </div>
                </div>

                <WebAppAboutSection
                  label="About"
                  brandSlug={brand.data?.slug}
                  text={brand.data?.description || ""}
                  coverUrl={brand.data?.coverUrl || ""}
                  youtubeUrl={
                    brand.data?.youtubeChannelId
                      ? `https://www.youtube.com/channel/${brand.data?.youtubeChannelId}`
                      : undefined
                  }
                  twitchUrl={brand.data?.twitchUrl || ""}
                  twitterUrl={brand.data?.xUrl || ""}
                  telegramUrl={brand.data?.telegramUrl || ""}
                  websiteUrl={brand.data?.websiteUrl || ""}
                  brandId={brand.data?.id || ""}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Sidebar - fixed width and no scroll */}
      <div className="flex flex-col justify-center items-center w-full md:w-[31%] md:min-h-screen md:h-screen md:pr-6 py-4 md:py-6 px-4 md:px-0">
        <CTSCard
          brandSlug={brand.data?.slug || ""}
          className={cn(
            "flex flex-col justify-between items-center w-full bg-card p-4 md:p-5",
            "min-h-[400px] md:h-full",
            brand.data?.slug === THE_ROLLUP_BRAND_SLUG && "bg-white",
          )}>
          <div className="flex flex-col justify-start items-start w-full h-full gap-4 md:gap-5">
            <div className="flex justify-start items-center w-full gap-2.5">
              <Sparkles
                className={cn(
                  "size-6 md:size-8 text-foreground shrink-0",
                  brand.data?.slug === THE_ROLLUP_BRAND_SLUG && "text-black",
                )}
              />
              <h1 className="text-2xl md:text-3xl font-bold w-full text-start">
                Interact with the stream
              </h1>
            </div>

            <Separator className="w-full bg-border" />

            <AnimatePresence mode="wait">
              {sideBarLoading ? (
                <motion.div
                  key="side-bar-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex justify-center items-center w-full h-full">
                  <Loader2
                    className={cn(
                      "size-8 text-foreground animate-spin",
                      brand.data?.slug === THE_ROLLUP_BRAND_SLUG &&
                        "text-black",
                    )}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="side-bar-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex flex-col justify-start items-start w-full h-full gap-6 md:gap-8">
                  {/* Tip/Sponsor Toggle - Show when creator exists on Pyro */}
                  {pyroCreatorExists?.exists && brand.data?.pyroMint && (
                    <div className="flex flex-col w-full gap-3">
                      {/* Toggle Buttons */}
                      <div className="flex w-full bg-muted/50 rounded-lg p-1 gap-1">
                        <button
                          onClick={() => setActiveTab("tip")}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all",
                            activeTab === "tip"
                              ? "bg-background shadow-sm text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}>
                          <Heart className="size-4" />
                          Tip
                        </button>
                        <button
                          onClick={() => setActiveTab("sponsor")}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all",
                            activeTab === "sponsor"
                              ? "bg-background shadow-sm text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}>
                          <Flame className="size-4" />
                          Sponsor with Pyro
                        </button>
                      </div>

                      {/* Content based on active tab */}
                      <AnimatePresence mode="wait">
                        {activeTab === "tip" ? (
                          <motion.div
                            key="tip-content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}>
                            {brand.tipSettings.data?.payoutAddress ? (
                              <WebAppTips
                                showLabel={false}
                                tips={[
                                  { amount: 0.01, buttonColor: "blue" },
                                  { amount: 0.25, buttonColor: "blue" },
                                  { amount: 1, buttonColor: "blue" },
                                ]}
                                customTipButton={{
                                  color: "blue",
                                  text: "Custom",
                                }}
                                tipSettings={brand.tipSettings.data}
                                user={user.data}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Tipping is not configured for this stream
                              </p>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="sponsor-content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}>
                            <WebAppPyroSponsor
                              showLabel={false}
                              creatorTokenAddress={brand.data.pyroMint}
                              zoraHandle={pyroCreatorExists?.creatorInfo?.zoraHandle}
                              user={user.data}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Tips Only - Show if tip settings exist but no pyro (no toggle needed) */}
                  {brand.tipSettings.data?.payoutAddress && !brand.data?.pyroMint && (
                    <WebAppTips
                      showLabel
                      tips={[
                        { amount: 0.01, buttonColor: "blue" },
                        { amount: 0.25, buttonColor: "blue" },
                        { amount: 1, buttonColor: "blue" },
                      ]}
                      customTipButton={{
                        color: "blue",
                        text: "Custom",
                      }}
                      tipSettings={brand.tipSettings.data}
                      user={user.data}
                    />
                  )}

                  {/* Creator Coin */}
                  {brand.creatorCoin.data && (
                    <WebAppCreatorCoin
                      coin={brand.creatorCoin.data}
                      user={user.data}
                    />
                  )}

                  {/* Featured Tokens */}
                  {brand.featuredTokens.data &&
                    brand.featuredTokens.data.length > 0 && (
                      <WebAppFeaturedTokens
                        tokens={brand.featuredTokens.data}
                        user={user.data}
                      />
                    )}

                  {/* Poll Card */}
                  {brand.data && (
                    <WebAppPollCard brand={brand.data} user={user.data} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {user.data ? (
              <motion.div
                key="user-info-logout-cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3 sm:gap-0">
                <div className="flex justify-start items-center gap-2.5 w-full sm:w-auto min-w-0 flex-1">
                  {user.data?.avatarUrl ? (
                    <Image
                      src={user.data.avatarUrl}
                      alt="user avatar"
                      width={32}
                      height={32}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className={cn(
                        "size-8 rounded-full bg-muted flex justify-center items-center shrink-0",
                        brand.data?.slug === THE_ROLLUP_BRAND_SLUG &&
                          "bg-gray-200",
                      )}>
                      <User className="size-6 text-foreground" />
                    </div>
                  )}
                  <h1 className="text-lg sm:text-[21px] font-bold truncate">
                    {user.data?.username ||
                      formatWalletAddress(connectedAddress)}
                  </h1>
                </div>
                <LogoutButton
                  key="logout-button"
                  brandSlug={brand.data?.slug || ""}
                  disabled={isLoggingOut}
                  executeLogout={handleLogout}
                  className="h-[42px] w-full sm:w-auto">
                  <AnimatePresence mode="wait">
                    {isLoggingOut ? (
                      <motion.div
                        key="logout-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex justify-center items-center w-full gap-2">
                        <Loader2 className="size-5 text-destructive animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="logout-button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex justify-start items-center w-full gap-2">
                        <LogOut className="size-4 text-destructive" />
                        <p className="text-base font-bold text-destructive">
                          Logout
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </LogoutButton>
              </motion.div>
            ) : connectedAddress && !wasNotConnected ? (
              <motion.div
                key="user-info-logout-cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex justify-center items-center w-full">
                {brand.data?.slug === THE_ROLLUP_BRAND_SLUG ? (
                  <TheRollupButton
                    onClick={() => signInWithWebApp()}
                    disabled={isSigningIn}
                    className="bg-accent w-full sm:w-auto h-[42px]">
                    <AnimatePresence mode="wait">
                      {isSigningIn ? (
                        <motion.div
                          key="signing-in"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex justify-center items-center w-full gap-2">
                          <Loader2 className="size-5 text-white animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="connect-wallet-button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex justify-center items-center w-full gap-2">
                          <p className="text-base font-extrabold text-white">
                            Sign message
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TheRollupButton>
                ) : (
                  <CTSButton
                    onClick={() => signInWithWebApp()}
                    disabled={isSigningIn}
                    className="w-full sm:w-auto h-[42px]">
                    <AnimatePresence mode="wait">
                      {isSigningIn ? (
                        <motion.div
                          key="signing-in"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex justify-center items-center w-full gap-2">
                          <Loader2 className="size-5 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="connect-wallet-button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex justify-center items-center w-full gap-2">
                          <p className="text-base font-extrabold">
                            Sign message
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CTSButton>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="user-info-logout-cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex justify-center items-center w-full">
                {brand.data?.slug === THE_ROLLUP_BRAND_SLUG ? (
                  <TheRollupButton
                    disabled={isSigningIn}
                    onClick={async () => {
                      setWasNotConnected(true);
                      open({ view: "Connect", namespace: "eip155" });
                    }}
                    className="bg-accent w-full h-[42px]">
                    <AnimatePresence mode="wait">
                      {isSigningIn ? (
                        <motion.div
                          key="signing-in"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex justify-center items-center w-full gap-2">
                          <Loader2 className="size-5 text-white animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="connect-wallet-button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex justify-center items-center w-full gap-2">
                          <p className="text-base font-extrabold text-white">
                            Connect Wallet
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TheRollupButton>
                ) : (
                  <CTSButton
                    disabled={isSigningIn}
                    onClick={async () => {
                      setWasNotConnected(true);
                      open({ view: "Connect", namespace: "eip155" });
                    }}
                    className="w-full h-[42px]">
                    <AnimatePresence mode="wait">
                      {isSigningIn ? (
                        <motion.div
                          key="signing-in"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex justify-center items-center w-full gap-2">
                          <Loader2 className="size-5 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="connect-wallet-button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex justify-center items-center w-full gap-2">
                          <p className="text-base font-extrabold">
                            Connect Wallet
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CTSButton>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CTSCard>
      </div>
    </motion.div>
  );
};
