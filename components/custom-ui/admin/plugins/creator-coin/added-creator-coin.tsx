import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { CTSCard } from "@/components/custom-ui/cts-card";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import {
  useCreatorCoins,
  useDeleteCreatorCoin,
} from "@/hooks/use-creator-coin";
import { CreatorCoin } from "@/lib/database/db.schema";
import {
  formatWalletAddress,
  getChainName,
  getIpfsGatewayUrls,
} from "@/lib/utils";

interface AddedCreatorCoinProps {
  coin: CreatorCoin;
  index: number;
}

export const AddedCreatorCoin = ({ coin, index }: AddedCreatorCoinProps) => {
  const { brand } = useAdminAuth();
  const creatorCoinsQuery = useCreatorCoins(brand.data?.id);
  const { mutate: deleteCreatorCoin } = useDeleteCreatorCoin();
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);

  // Get all gateway URLs for the coin logo
  const gatewayUrls = coin.logoUrl ? getIpfsGatewayUrls(coin.logoUrl) : [];
  const currentImageUrl = gatewayUrls[gatewayIndex] || "";

  // Reset gateway index when coin changes
  useEffect(() => {
    setGatewayIndex(0);
    setImageError(false);
  }, [coin.logoUrl]);

  // Handles the deletion of the coin from the list
  const handleDeleteCoin = () => {
    setIsDeleting(true);
    deleteCreatorCoin(
      { coinId: coin.id },
      {
        onSuccess: async () => {
          await creatorCoinsQuery.refetch();
          setIsDeleting(false);
        },
        onError: () => {
          setIsDeleting(false);
          toast.error("An error occurred while deleting the creator coin");
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
      transition={{
        duration: 0.2,
        delay: 0.1 * index,
        ease: "easeInOut",
        layout: { duration: 0.185, ease: "easeOut" },
      }}>
      <CTSCard className="p-5 gap-2.5 flex-1 min-w-[300px]">
        {/* Coin information */}
        <div className="flex justify-between items-center w-full gap-3">
          <div className="flex justify-start items-center gap-2.5">
            {coin.logoUrl && !imageError && currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt={coin.name ?? ""}
                className="size-10 rounded-full"
                priority
                width={40}
                height={40}
                onError={() => {
                  // Try next gateway if available
                  if (gatewayIndex < gatewayUrls.length - 1) {
                    setGatewayIndex(gatewayIndex + 1);
                  } else {
                    // All gateways failed, show fallback
                    setImageError(true);
                  }
                }}
              />
            ) : (
              <Image
                src="/images/coin.svg"
                alt={coin.name ?? ""}
                className="size-10 rounded-full"
                priority
                width={40}
                height={40}
              />
            )}
            <div className="flex flex-col justify-start items-start gap-0.5">
              <h1 className="text-lg font-bold">{coin.name}</h1>
              <p className="text-sm opacity-50 font-bold">{coin.symbol}</p>
            </div>
          </div>
          <div className="flex flex-col justify-start items-end gap-0.5">
            <p className="text-sm opacity-50 font-bold">
              {coin.chainId
                ? getChainName(coin.chainId.toString())
                : "Unknown chain"}
            </p>
            {coin.address ? (
              <p className="text-sm opacity-50 font-bold">
                {formatWalletAddress(coin.address)}
              </p>
            ) : (
              <p className="text-sm opacity-50 font-bold">No Address</p>
            )}
          </div>
        </div>

        {/* Delete button */}
        <div className="flex justify-between items-center w-full gap-2.5">
          <CTSButton
            className="w-full h-[42px]"
            variant="destructive"
            onClick={handleDeleteCoin}>
            <AnimatePresence mode="wait">
              {isDeleting ? (
                <motion.div
                  key="deleting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <Loader2 className="size-5 text-foreground animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="remove"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <p className="text-base font-extrabold text-foreground">
                    Remove
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CTSButton>
        </div>
      </CTSCard>
    </motion.div>
  );
};
