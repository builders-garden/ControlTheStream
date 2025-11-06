import ky from "ky";
import { Loader2, Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAddress } from "viem/utils";
import { CancelButton } from "@/components/custom-ui/cancel-button";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { CTSModal } from "@/components/custom-ui/cts-modal";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useCreateCreatorCoin } from "@/hooks/use-creator-coin";
import { useDebounce } from "@/hooks/use-debounce";
import { useZoraCoin } from "@/hooks/use-zora-coin";
import { CreatorCoin } from "@/lib/database/db.schema";
import { Token } from "@/lib/types/tokens.type";
import { cn, deepCompareZerionTokens } from "@/lib/utils";
import { NewfoundToken } from "../tokens/newfound-token";

interface CreatorCoinSearchModalProps {
  addedCoins: CreatorCoin[];
  disabled: boolean;
  onSuccess?: () => void;
}

export const CreatorCoinSearchModal = ({
  addedCoins,
  disabled,
  onSuccess,
}: CreatorCoinSearchModalProps) => {
  const { brand } = useAdminAuth();
  const { mutate: createCreatorCoin } = useCreateCreatorCoin();
  const { mutate: getZoraCoin } = useZoraCoin();

  const [searchValue, setSearchValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  // Creator coins are only supported on Base chain
  const selectedChainName = "base";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchedTokens, setFetchedTokens] = useState<Token[]>([]);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [fetchingError, setFetchingError] = useState<Error | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [isCreatingCreatorCoins, setIsCreatingCreatorCoins] = useState(false);

  // Debounce search value to avoid too frequent API calls
  const debouncedSearchValue = useDebounce(searchValue, 750);

  // Disabled state for the tokens (only 1 coin allowed)
  const isLimitReached = addedCoins.length + selectedTokens.length >= 1;

  // When the search changes or the chain changes, fetch the new tokens
  useEffect(() => {
    const fetchTokens = async () => {
      setIsFetchingTokens(true);
      setFetchingError(null);
      setSelectedTokens([]);
      try {
        let searchParams = "";
        if (debouncedSearchValue) {
          if (isAddress(debouncedSearchValue)) {
            searchParams += `&token_address=${debouncedSearchValue}`;
          } else {
            searchParams += `&search_query=${debouncedSearchValue}`;
          }
        }
        const tokens = await ky
          .get<{
            data: Token[];
            success: boolean;
          }>(`/api/tokens?chain_name=${selectedChainName}${searchParams}`)
          .json();

        if (tokens.success) {
          // Filter out tokens that are already added (by address and chainId)
          const cleanedTokens = tokens.data.filter(
            (token) =>
              !addedCoins.some(
                (coin) =>
                  coin.address.toLowerCase() ===
                    (token.address || "").toLowerCase() &&
                  coin.chainId === parseInt(token.chainId || "1"),
              ),
          );
          setFetchedTokens(cleanedTokens);
        } else {
          setFetchingError(
            new Error("An error occurred, please try again later."),
          );
        }
      } catch (error) {
        console.error("Error fetching tokens", error);
        setFetchingError(error as Error);
      } finally {
        setIsFetchingTokens(false);
        setHasFetchedOnce(true);
      }
    };

    if (selectedChainName && !isFetchingTokens) {
      fetchTokens();
    }
  }, [selectedChainName, debouncedSearchValue]);

  // A function to handle the confirmation of the selected token
  const handleConfirm = () => {
    if (!brand.data || !brand.data.id || selectedTokens.length === 0) return;

    // Only take the first selected token (since we only allow 1 coin)
    const token = selectedTokens[0];
    const chainId = parseInt(token.chainId || "1");

    setIsCreatingCreatorCoins(true);

    // Helper function to create the creator coin with logoUrl
    const createCoinWithLogoUrl = (logoUrl: string) => {
      createCreatorCoin(
        {
          brandId: brand.data!.id,
          address: token.address || "",
          chainId: chainId,
          symbol: token.symbol || "",
          name: token.name || "",
          logoUrl: logoUrl,
        },
        {
          onSuccess: async () => {
            // Refetch creator coins
            if (onSuccess) {
              await onSuccess();
            }

            setIsCreatingCreatorCoins(false);
            setIsModalOpen(false);
            setTimeout(() => {
              setFetchedTokens(
                fetchedTokens.filter(
                  (fetchedToken) =>
                    !deepCompareZerionTokens(fetchedToken, token),
                ),
              );
              setSelectedTokens([]);
            }, 300);
            toast.success("Creator coin added successfully");
          },
          onError: () => {
            toast.error("An error occurred while adding the creator coin");
            setIsCreatingCreatorCoins(false);
          },
        },
      );
    };

    // First, try to fetch Zora coin info to get originalUri
    if (token.address) {
      console.log("Fetching Zora coin info for address:", token.address);
      getZoraCoin(
        { address: token.address },
        {
          onSuccess: (zoraCoinData) => {
            console.log("✅ Zora coin data received:", zoraCoinData);
            console.log("Coin name:", zoraCoinData.name);
            console.log("Coin symbol:", zoraCoinData.symbol);
            console.log("Coin address:", zoraCoinData.address);
            console.log("Coin description:", zoraCoinData.description);
            console.log("Coin total supply:", zoraCoinData.totalSupply);
            console.log("Coin total volume:", zoraCoinData.totalVolume);
            console.log("Coin 24h volume:", zoraCoinData.volume24h);
            console.log("Coin market cap:", zoraCoinData.marketCap);
            console.log("Coin creator address:", zoraCoinData.creatorAddress);
            console.log("Coin created at:", zoraCoinData.createdAt);
            console.log("Coin original URI:", zoraCoinData.originalUri);
            console.log("Coin IPFS CID:", zoraCoinData.ipfsCid);

            // Use ipfsCid from API response (CID only, no gateway URL), fallback to token.iconUrl
            // Store only the CID in the database
            const logoUrl = zoraCoinData.ipfsCid || token.iconUrl || "";

            // Create the creator coin with the logoUrl (which will be the IPFS CID)
            createCoinWithLogoUrl(logoUrl);
          },
          onError: (error) => {
            // Check if it's a 404 (coin not found on Zora) - this is expected for non-Zora tokens
            const errorMessage = error?.message || "";
            const errorString = String(error || "");
            if (
              errorMessage.includes("404") ||
              errorMessage.includes("not found") ||
              errorString.includes("404") ||
              errorString.includes("not found")
            ) {
              console.log(
                "ℹ️ Token is not a Zora coin (this is expected for non-Zora tokens):",
                token.address,
              );
            } else {
              console.error("❌ Error fetching Zora coin info:", error);
            }

            // Fall back to token.iconUrl if Zora coin is not found or error occurred
            createCoinWithLogoUrl(token.iconUrl || "");
          },
        },
      );
    } else {
      // If no address, use token.iconUrl as fallback
      createCoinWithLogoUrl(token.iconUrl || "");
    }
  };

  return (
    <CTSModal
      trigger={
        <CTSButton className="w-[200px]" disabled={disabled}>
          <div className="flex justify-center items-center w-full gap-1.5 text-background">
            <Plus className="size-4.5" />
            <p className="text-base font-extrabold text-nowrap">Add coin</p>
          </div>
        </CTSButton>
      }
      isOpen={isModalOpen}
      setIsOpen={setIsModalOpen}
      contentClassName="p-4 sm:p-6 rounded-[12px] sm:max-w-2xl">
      <h1 className="text-2xl font-bold text-center">
        Search for a token on Base
      </h1>

      {/* Search for tokens on Base chain */}
      <div className="flex justify-start items-center w-full gap-2.5">
        <div
          className={cn(
            "flex w-full justify-start items-center gap-2.5 rounded-[12px] border-muted border-[1px] ring-muted-foreground/40 px-5 py-2.5 transition-all duration-300",
            isEditing && "ring-[2px] border-muted-foreground/40",
          )}>
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Search your creator token by its address on Base"
            className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
          <AnimatePresence mode="wait" initial={false}>
            {isEditing && (
              <motion.button
                key="x-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                onClick={() => {
                  setSearchValue("");
                }}
                className="cursor-pointer">
                <X className="size-5 shrink-0" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Found tokens list */}
      <ScrollArea
        className="w-full h-[392px] mt-[18px]"
        scrollBarThumbClassName="bg-muted/40">
        <AnimatePresence mode="wait" initial={false}>
          {fetchingError ? (
            <motion.div
              key="fetching-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-lg font-bold text-destructive">
                An error occurred, please try again later.
              </p>
            </motion.div>
          ) : isFetchingTokens ? (
            <motion.div
              key="fetching-tokens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <Loader2 className="size-8 text-foreground animate-spin" />
            </motion.div>
          ) : fetchedTokens.length > 0 ? (
            <motion.div
              key="fetched-tokens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col justify-start items-center w-full pr-4 gap-2">
              {fetchedTokens.map((token, index) => (
                <NewfoundToken
                  key={index}
                  index={index}
                  disabled={isLimitReached}
                  token={token}
                  selectedTokens={selectedTokens}
                  setSelectedTokens={(
                    newTokens: Token[] | ((prev: Token[]) => Token[]),
                  ) => {
                    // Only allow 1 token at a time - if adding a new one, replace the existing
                    const tokensArray =
                      typeof newTokens === "function"
                        ? newTokens(selectedTokens)
                        : newTokens;

                    if (tokensArray.length > selectedTokens.length) {
                      // A token was just added, keep only the newly added one
                      const newlyAdded = tokensArray.filter(
                        (t: Token) =>
                          !selectedTokens.some((st: Token) =>
                            deepCompareZerionTokens(st, t),
                          ),
                      );
                      setSelectedTokens(newlyAdded);
                    } else {
                      // Token was removed, use the new list as is
                      setSelectedTokens(tokensArray);
                    }
                  }}
                />
              ))}
            </motion.div>
          ) : hasFetchedOnce ? (
            <motion.div
              key="no-tokens-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-lg font-bold">No tokens found</p>
            </motion.div>
          ) : (
            <motion.div
              key="start-typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex justify-center items-center w-full h-[392px]">
              <p className="text-lg font-bold">
                Start typing to search for tokens on Base
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Selected tokens count */}
      <div className="flex justify-end items-center w-full pb-2 pr-3 -mt-1">
        <p className="text-sm font-bold">
          Selected {selectedTokens.length}/{1 - addedCoins.length}
        </p>
      </div>

      {/* Bottom modal buttons */}
      <div className="flex flex-col justify-center items-center w-full gap-2">
        <CTSButton
          key="confirm"
          className="w-full h-[42px]"
          disabled={selectedTokens.length !== 1 || isCreatingCreatorCoins}
          onClick={handleConfirm}>
          <AnimatePresence mode="wait">
            {isCreatingCreatorCoins ? (
              <motion.div
                key="creating-creator-coins-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}>
                <Loader2 className="size-5 text-background animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="confirm-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}>
                <p className="text-base text-background font-extrabold">
                  Confirm
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CTSButton>
        <CancelButton onClick={() => setIsModalOpen(false)} />
      </div>
    </CTSModal>
  );
};
