import Image from "next/image";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { TheRollupButton } from "@/components/custom-ui/tr-button";
import { useWebAppAuth } from "@/contexts/auth/web-app-auth-context";
import { useCreateFeaturedTokenOpen } from "@/hooks/use-featured-tokens-opens";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { FeaturedToken } from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { User } from "@/lib/types/user.type";
import { getChainLogoUrl } from "@/lib/utils";

interface WebAppFeaturedTokensProps {
  tokens: FeaturedToken[];
  user?: User;
}

export const WebAppFeaturedTokens = ({
  tokens,
  user,
}: WebAppFeaturedTokensProps) => {
  // Get the brand slug
  const { brand } = useWebAppAuth();

  // Mutation hook for creating a featured token open
  const { mutate: createFeaturedTokenOpen } = useCreateFeaturedTokenOpen(
    AuthTokenType.WEB_APP_AUTH_TOKEN,
  );

  // Handle open token page (_blank)
  const handleOpenTokenPage = (token: FeaturedToken) => {
    if (!token.chainId) return;
    // Get the matcha token URL
    const matchaTokenUrl = `https://matcha.xyz/tokens/${token.chainId}/${token.address || "eth"}`;

    // Get the chain logo URL
    const chainLogoUrl = token.chainId
      ? getChainLogoUrl(token.chainId.toString())
      : null;

    // Create a record in the database
    createFeaturedTokenOpen({
      name: token.name || "",
      brandId: token.brandId || "",
      address: token.address || "",
      chainId: token.chainId || 0,
      decimals: token.decimals || 18,
      chainLogoUrl: chainLogoUrl,
      logoUrl: token.logoUrl || "",
      symbol: token.symbol || "",
      description: token.description || "",
      openerId: user?.id || "",
      externalUrl: matchaTokenUrl,
      platform: "web-app",
    });

    // Open the token page in a new tab
    window.open(matchaTokenUrl, "_blank");
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-2xl font-bold">Featured Tokens</h1>
      <div className="grid grid-cols-2 w-full gap-2.5">
        {tokens.map((token, index) => {
          return brand.data?.slug === THE_ROLLUP_BRAND_SLUG ? (
            <TheRollupButton
              key={index}
              onClick={() => handleOpenTokenPage(token)}
              className="flex justify-between items-center w-full">
              <div className="flex justify-start items-center w-full gap-2">
                <div className="relative size-[32px]">
                  <Image
                    src={token.logoUrl || "/images/coin.svg"}
                    alt={token.name + index.toString()}
                    width={32}
                    height={32}
                  />
                  <Image
                    src={token.chainLogoUrl || ""}
                    alt={token.chainId?.toString() || ""}
                    className="absolute bottom-0 -right-0.5 rounded-full"
                    width={13}
                    height={13}
                  />
                </div>
                <p className="text-base font-extrabold break-words">
                  ${token.symbol || token.name || ""}
                </p>
              </div>
            </TheRollupButton>
          ) : (
            <CTSButton
              key={index}
              onClick={() => handleOpenTokenPage(token)}
              className="flex justify-between items-center w-full bg-background hover:bg-background/80 border-2 border-border">
              <div className="flex justify-start items-center w-full gap-2">
                <div className="relative size-[32px]">
                  <Image
                    src={token.logoUrl || "/images/coin.svg"}
                    alt={token.name + index.toString()}
                    width={32}
                    height={32}
                  />
                  <Image
                    src={token.chainLogoUrl || ""}
                    alt={token.chainId?.toString() || ""}
                    className="absolute bottom-0 -right-0.5 rounded-full"
                    width={13}
                    height={13}
                  />
                </div>
                <p className="text-base font-extrabold break-words text-foreground">
                  ${token.symbol || token.name || ""}
                </p>
              </div>
            </CTSButton>
          );
        })}
      </div>
    </div>
  );
};
