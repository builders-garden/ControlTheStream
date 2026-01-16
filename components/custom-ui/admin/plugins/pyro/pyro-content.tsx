import { Flame, Loader2, LogOut, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import {
  usePyroDisconnect,
  usePyroRequestOtp,
  usePyroVerifyOtp,
} from "@/hooks/use-pyro-auth";
import { usePyroLeaderboard } from "@/hooks/use-pyro-leaderboard";
import { PyroLeaderboardEntryCard } from "./pyro-leaderboard-entry";
import { PyroNoAccount } from "./pyro-no-account";

type PyroAuthStep = "email" | "otp" | "connected";

export const PyroContent = () => {
  const { brand } = useAdminAuth();
  const brandData = useMemo(() => brand.data, [brand.data]);

  console.log("brandData:", brandData);
  // DB values - permanent association, used for leaderboard
  const pyroMint = useMemo(() => brandData?.pyroMint, [brandData?.pyroMint]);
  const pyroEmail = useMemo(() => brandData?.pyroEmail, [brandData?.pyroEmail]);

  // UI session state - separate from DB values
  // Users can disconnect/reconnect without affecting DB
  const [isSessionActive, setIsSessionActive] = useState(!!pyroMint);
  const [authStep, setAuthStep] = useState<PyroAuthStep>(
    pyroMint ? "connected" : "email",
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Mutations
  const { mutate: requestOtp, isPending: isRequestingOtp } =
    usePyroRequestOtp();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = usePyroVerifyOtp();
  const { mutate: disconnect, isPending: isDisconnecting } =
    usePyroDisconnect();

  // Leaderboard data
  const {
    data: leaderboardData,
    isLoading: isLoadingLeaderboard,
    refetch: refetchLeaderboard,
  } = usePyroLeaderboard({
    mint: pyroMint,
    enabled: !!pyroMint,
  });

  const leaderboard = leaderboardData?.data?.leaderboard || [];
  const hasLeaderboard = leaderboard.length > 0;
  // Show connected UI when session is active (regardless of DB state)
  // Leaderboard still uses pyroMint from DB
  const showConnectedUI = isSessionActive && pyroMint;

  // Handle request OTP
  const handleRequestOtp = useCallback(() => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    requestOtp(
      { email },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Verification code sent to your email");
            setAuthStep("otp");
          } else {
            toast.error(data.error || "Failed to send verification code");
          }
        },
        onError: () => {
          toast.error("Failed to send verification code");
        },
      },
    );
  }, [email, requestOtp]);

  // Handle verify OTP
  const handleVerifyOtp = useCallback(() => {
    if (!otp || !brandData?.slug) {
      toast.error("Please enter the verification code");
      return;
    }

    verifyOtp(
      { email, otp, brandSlug: brandData.slug },
      {
        onSuccess: async (data) => {
          if (data.success) {
            if (data.hasCreator) {
              toast.success("Pyro account connected successfully!");
              await brand.refetch();
              await refetchLeaderboard();
              setIsSessionActive(true);
              setAuthStep("connected");
              setEmail("");
              setOtp("");
            } else {
              // User verified but has no creator page
              toast.error("No Pyro creator page found for this account");
              setAuthStep("email");
              setOtp("");
            }
          } else {
            toast.error(data.error || "Invalid verification code");
          }
        },
        onError: () => {
          toast.error("Failed to verify code");
        },
      },
    );
  }, [email, otp, brandData?.slug, verifyOtp, brand, refetchLeaderboard]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    if (!brandData?.slug) return;

    disconnect(
      { brandSlug: brandData.slug },
      {
        onSuccess: async (data) => {
          if (data.success) {
            toast.success("Pyro account disconnected");
            setIsSessionActive(false);
            setAuthStep("email");
          } else {
            toast.error(data.error || "Failed to disconnect");
          }
        },
        onError: () => {
          toast.error("Failed to disconnect Pyro account");
        },
      },
    );
  }, [brandData?.slug, disconnect, brand]);

  // Handle back to email step
  const handleBackToEmail = () => {
    setAuthStep("email");
    setOtp("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-2xl">
        Connect your Pyro account to display sponsor leaderboards
      </h1>

      <AnimatePresence mode="wait">
        {/* Email Input Step */}
        {!showConnectedUI && authStep === "email" && (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col gap-4 w-full max-w-md">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="size-4" />
                Pyro Account Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your Pyro account email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-muted bg-background text-base outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  disabled={isRequestingOtp}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRequestOtp}
                  disabled={isRequestingOtp || !email}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
                  {isRequestingOtp ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Flame className="size-4" />
                  )}
                  Send Code
                </motion.button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              We&apos;ll send a verification code to your email to connect your
              Pyro account.
            </p>
          </motion.div>
        )}

        {/* OTP Input Step */}
        {!showConnectedUI && authStep === "otp" && (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col gap-4 w-full max-w-md">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Verification Code
              </label>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-muted bg-background text-base outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all tracking-widest text-center font-mono text-lg"
                  disabled={isVerifyingOtp}
                  maxLength={6}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
                  {isVerifyingOtp ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </motion.button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToEmail}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Use different email
              </button>
              <button
                onClick={handleRequestOtp}
                disabled={isRequestingOtp}
                className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                Resend code
              </button>
            </div>
          </motion.div>
        )}

        {/* Connected State */}
        {showConnectedUI && (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col gap-5 w-full">
            {/* Connected Account Info */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-orange-500/20">
                  <Flame className="size-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold">Pyro Account Connected</p>
                  <p className="text-sm text-muted-foreground">{pyroEmail}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive border border-muted hover:border-destructive rounded-lg transition-colors">
                {isDisconnecting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                Disconnect
              </motion.button>
            </div>

            {/* Leaderboard Content */}
            <AnimatePresence mode="wait">
              {isLoadingLeaderboard ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="flex justify-center items-center w-full h-[200px]">
                  <Loader2 className="size-10 text-orange-500 animate-spin" />
                </motion.div>
              ) : !hasLeaderboard ? (
                <motion.div
                  key="empty-leaderboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex flex-col justify-center items-center w-full py-12 gap-4">
                  <div className="flex justify-center items-center size-16 rounded-full bg-muted">
                    <Flame className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-center">
                    No Sponsors Yet
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Your Pyro page is connected but doesn&apos;t have any
                    sponsors yet. Share your page to start receiving sponsor
                    burns!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex flex-col gap-4 w-full">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">
                      Sponsor Leaderboard
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {leaderboard.length} sponsor
                      {leaderboard.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid gap-4 w-full">
                    {leaderboard.map((entry, index) => (
                      <PyroLeaderboardEntryCard
                        key={`${entry.rank}-${entry.externalSponsor?.name || entry.promotedToken?.mint}`}
                        entry={entry}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* No Pyro Account - Show when verified but no creator */}
        {!showConnectedUI && authStep === "email" && (
          <PyroNoAccount key="no-account-cta" />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
