import { useAppKit } from "@reown/appkit/react";
import { Loader2, LogOut, Sparkles, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import { useLastYoutubeContent } from "@/hooks/use-last-youtube-content";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { cn, formatWalletAddress } from "@/lib/utils";
import { env } from "@/lib/zod";
import { WebAppFeaturedTokens } from "@/plugins/web-app/featured-tokens/web-app-featured-tokens";
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

  // Get the last youtube content for this brand
  const { data: lastYoutubeContent, isLoading: isLastYoutubeContentLoading } =
    useLastYoutubeContent(brand.data?.slug || "");

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
      className="flex justify-between items-center min-h-screen w-full">
      {/* Video and info area - scrollable vertically */}
      <ScrollArea scrollBarClassName="w-0" className="w-full">
        <div className="flex flex-col justify-start items-center h-screen w-full p-6 gap-5">
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
                className="flex flex-col justify-start items-center w-full gap-5">
                <div className="flex justify-between items-center w-full px-5">
                  <div className="flex justify-start items-center gap-5">
                    <div className="relative flex justify-center items-center bg-black/10 rounded-full">
                      {brand.data?.logoUrl ? (
                        <Image
                          src={brand.data?.logoUrl}
                          alt={brand.data?.name || ""}
                          width={86}
                          height={86}
                          className="rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex justify-center items-center size-[86px] bg-black/10 rounded-full">
                          <p className="text-5xl font-bold text-center text-black/60">
                            {brand.data?.name?.slice(0, 1).toUpperCase() || ""}
                          </p>
                        </div>
                      )}
                      {lastYoutubeContent?.data?.isLive && (
                        <div className="absolute bottom-0 left-0 right-0 top-0 size-[86px] border-3 border-destructive rounded-full" />
                      )}
                      {lastYoutubeContent?.data?.isLive && (
                        <div className="absolute flex justify-center items-center -bottom-1 left-1/2 transform -translate-x-1/2 bg-destructive rounded-sm w-fit px-2 py-[1px]">
                          <p className="text-base text-foreground font-bold">
                            LIVE
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center items-start gap-1 h-full">
                      <h1 className="text-3xl font-bold">
                        {lastYoutubeContent?.data?.title || ""}
                      </h1>
                      <p className="text-lg text-gray-500">
                        by {brand.data?.name}
                      </p>
                    </div>
                  </div>

                  {/* Share button */}
                  <ShareButton
                    copyLinkText={`${env.NEXT_PUBLIC_URL}/${brand.data?.slug}`}
                    buttonClassName="shrink-1 w-min cursor-pointer"
                    buttonSize="lg"
                    brandName={brand.data?.name}
                  />
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
      <div className="flex flex-col justify-center items-center min-h-screen h-screen w-[31%] pr-6 py-6">
        <CTSCard
          brandSlug={brand.data?.slug || ""}
          className={cn(
            "flex flex-col justify-between items-center h-full w-full bg-card p-5",
            brand.data?.slug === THE_ROLLUP_BRAND_SLUG && "bg-white",
          )}>
          <div className="flex flex-col justify-start items-start w-full h-full gap-5">
            <div className="flex justify-start items-center w-full gap-2.5">
              <Sparkles
                className={cn(
                  "size-8 text-foreground",
                  brand.data?.slug === THE_ROLLUP_BRAND_SLUG && "text-black",
                )}
              />
              <h1 className="text-3xl font-bold w-full text-start">
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
                  className="flex flex-col justify-start items-start w-full h-full gap-8">
                  {/* Tip Buttons */}
                  {brand.tipSettings.data?.payoutAddress && (
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
                className="flex justify-between items-center w-full">
                <div className="flex justify-start items-center gap-2.5 w-full">
                  {user.data?.avatarUrl ? (
                    <Image
                      src={user.data.avatarUrl}
                      alt="user avatar"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "size-8 rounded-full bg-muted flex justify-center items-center",
                        brand.data?.slug === THE_ROLLUP_BRAND_SLUG &&
                          "bg-gray-200",
                      )}>
                      <User className="size-6 text-foreground" />
                    </div>
                  )}
                  <h1 className="text-[21px] font-bold">
                    {user.data?.username ||
                      formatWalletAddress(connectedAddress)}
                  </h1>
                </div>
                <LogoutButton
                  key="logout-button"
                  brandSlug={brand.data?.slug || ""}
                  disabled={isLoggingOut}
                  executeLogout={handleLogout}
                  className="h-[42px]">
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
