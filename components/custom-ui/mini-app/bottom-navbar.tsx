import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useMiniAppAuth } from "@/contexts/auth/mini-app-auth-context";
import { useUsdcBalance } from "@/hooks/use-usdc-balance";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { User } from "@/lib/types/user.type";
import { cn, formatWalletAddress } from "@/lib/utils";
import { CTSButton } from "../cts-button";
import { TheRollupButton } from "../tr-button";

interface BottomNavbarProps {
  user: User;
}

export const BottomNavbar = ({ user }: BottomNavbarProps) => {
  const { brand } = useMiniAppAuth();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { address } = useAccount();
  const { balance: usdcBalance } = useUsdcBalance({ address });

  // Get the first wallet address with a base name
  const baseName = user.wallets.find((wallet) => wallet.baseName)?.baseName;

  // Handle Navbar Open
  const handleNavbarOpen = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-transparent px-5 pb-5 pt-3 transition-all duration-300",
        isNavbarOpen && "bg-background/90",
      )}>
      <div className="flex justify-between items-center w-full">
        {brand.data?.slug === THE_ROLLUP_BRAND_SLUG ? (
          <TheRollupButton
            className="rounded-full py-1 w-[116px] shrink-0"
            onClick={handleNavbarOpen}>
            <div className="flex justify-center items-center w-full gap-1.5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="User profile picture"
                  className="size-[24px] bg-warning rounded-full border border-black"
                />
              ) : (
                <div className="size-[24px] bg-warning rounded-full border border-black" />
              )}
              <p className="text-xl font-bold">
                ${Number(usdcBalance?.formatted).toFixed(1)}
              </p>
            </div>
          </TheRollupButton>
        ) : (
          <CTSButton
            className="rounded-full py-1 w-[116px] shrink-0 border border-muted bg-background hover:bg-background text-muted"
            onClick={handleNavbarOpen}>
            <div className="flex justify-center items-center w-full gap-1.5">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="User profile picture"
                  className="size-[24px] bg-warning rounded-full border border-black"
                />
              ) : (
                <div className="size-[24px] bg-warning rounded-full border border-black" />
              )}
              <p className="text-xl font-bold text-foreground">
                ${Number(usdcBalance?.formatted).toFixed(1)}
              </p>
            </div>
          </CTSButton>
        )}
        <div className="flex justify-center items-center w-full gap-1.5 flex-shrink-1">
          <motion.div
            animate={{ scale: isNavbarOpen ? 1 : 0 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="size-1 bg-destructive rounded-full"
          />
          <motion.div
            animate={{ scale: isNavbarOpen ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="size-1 bg-warning rounded-full"
          />
          <motion.div
            animate={{ scale: isNavbarOpen ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="size-1 bg-accent rounded-full"
          />
          <motion.div
            animate={{ scale: isNavbarOpen ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="size-1 bg-success rounded-full"
          />
        </div>

        <AnimatePresence mode="wait">
          {isNavbarOpen && (
            <motion.div
              key="base-name-or-address"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1, ease: "easeInOut" }}
              className="flex justify-center items-center shrink-0 font-bold">
              {baseName || formatWalletAddress(address)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
