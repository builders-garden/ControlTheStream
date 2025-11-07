import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useCreatorCoins } from "@/hooks/use-creator-coin";
import { AddedCreatorCoin } from "./added-creator-coin";
import { CreatorCoinSearchModal } from "./creator-coin-search-modal";

export const CreatorCoinContent = () => {
  const { brand } = useAdminAuth();
  const creatorCoinsQuery = useCreatorCoins(brand.data?.id);
  const addedCoins = useMemo(
    () => creatorCoinsQuery.data?.data || [],
    [creatorCoinsQuery.data],
  );

  // Disabled state for the add more coins button (only 1 coin allowed)
  const isAddMoreCoinsDisabled = addedCoins.length >= 1;

  // Show loading state while checking for creator coins
  if (creatorCoinsQuery.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-col justify-center items-center w-full h-full py-5 pr-5 gap-5">
        <div className="flex justify-center items-center gap-2">
          <Loader2 className="size-6 text-foreground animate-spin" />
          <p className="text-lg">Loading...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-start w-full h-full py-5 pr-5 gap-5">
      <h1 className="font-bold text-2xl">
        Feature your Creator Coin so viewers can trade it in real time.
      </h1>
      <div className="flex flex-col justify-start items-start w-full gap-5">
        <CreatorCoinSearchModal
          addedCoins={addedCoins}
          disabled={isAddMoreCoinsDisabled}
          onSuccess={() => creatorCoinsQuery.refetch()}
        />
        <div className="flex flex-wrap gap-5 w-full">
          <AnimatePresence>
            {addedCoins.map((coin, index) => (
              <AddedCreatorCoin
                key={`${coin.address}-${coin.chainId}`}
                index={index}
                coin={coin}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
