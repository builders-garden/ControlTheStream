import { ArrowUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TheRollupButton } from "@/components/custom-ui/tr-button";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { CreatorCoin } from "@/lib/database/db.schema";
import { getIpfsGatewayUrls } from "@/lib/utils";

interface WebAppCreatorCoinProps {
  coin: CreatorCoin;
}

export const WebAppCreatorCoin = ({ coin }: WebAppCreatorCoinProps) => {
  const { brand } = useWebAppAuth();
  const [imageError, setImageError] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);

  // Whether the brand is the Rollup
  const isBrandTheRollup = brand.data?.slug === THE_ROLLUP_BRAND_SLUG;

  // Get all gateway URLs for the coin logo
  const gatewayUrls = coin.logoUrl ? getIpfsGatewayUrls(coin.logoUrl) : [];
  const currentImageUrl = gatewayUrls[gatewayIndex] || "";

  // Reset image error state and gateway index when coin changes
  useEffect(() => {
    setImageError(false);
    setGatewayIndex(0);
  }, [coin.logoUrl]);

  // Handle open token page (_blank)
  const handleOpenTokenPage = () => {
    if (!coin.chainId) return;
    const matchaTokenUrl = `https://matcha.xyz/tokens/${coin.chainId}/${coin.address || "eth"}`;
    window.open(matchaTokenUrl, "_blank");
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-2xl font-bold">Creator Coin</h1>
      {isBrandTheRollup ? (
        <TheRollupButton
          onClick={handleOpenTokenPage}
          className="flex justify-between items-center w-full">
          <div className="flex justify-start items-center gap-4 flex-1 min-w-0">
            {/* Icon with upward arrow */}
            <div
              className="size-16 rounded-full flex justify-center items-center shrink-0"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
              {coin.logoUrl && !imageError && currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={coin.name || ""}
                  width={56}
                  height={56}
                  className="rounded-full"
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
                <ArrowUp className="size-8 text-white" strokeWidth={2} />
              )}
            </div>
            {/* Symbol */}
            <p className="text-xl font-extrabold uppercase truncate">
              ${coin.symbol || coin.name || ""}
            </p>
          </div>
        </TheRollupButton>
      ) : (
        <button
          onClick={handleOpenTokenPage}
          className="flex justify-between items-center w-full py-4 px-5 rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer"
          style={{ backgroundColor: "#57FFDD" }}>
          <div className="flex justify-start items-center gap-4 flex-1 min-w-0">
            {/* Icon with upward arrow */}
            <div
              className="size-16 rounded-full flex justify-center items-center shrink-0"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
              {coin.logoUrl && !imageError && currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={coin.name || ""}
                  width={56}
                  height={56}
                  className="rounded-full"
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
                <ArrowUp className="size-8 text-white" strokeWidth={2} />
              )}
            </div>
            {/* Symbol */}
            <p className="text-xl font-extrabold uppercase truncate text-black">
              ${coin.symbol || coin.name || ""}
            </p>
          </div>
        </button>
      )}
    </div>
  );
};
