import { env } from "@/lib/zod";
import {
  createCoin,
  getCoin,
  getCoins,
  getProfile,
  getProfileCoins,
  setApiKey,
} from "@zoralabs/coins-sdk";

export class ZoraService {
  constructor() {
    setApiKey(env.ZORA_API_KEY);
  }

  /**
   * Gets multiple coins by their addresses
   */
  async getCoins(addresses: string[], chainId: number) {
    try {
      const response = await getCoins({
        coins: addresses.map((address) => ({
          chainId,
          collectionAddress: address,
        })),
      });

      if (!response.data?.zora20Tokens) {
        throw new Error("Coins not found");
      }

      return response.data.zora20Tokens.map((coinData: any) => ({
        name: coinData?.name,
        symbol: coinData?.symbol,
        address: coinData?.address,
        description: coinData?.description,
        totalSupply: coinData?.totalSupply,
        totalVolume: coinData?.totalVolume,
        volume24h: coinData?.volume24h,
        createdAt: coinData?.createdAt,
        creatorAddress: coinData?.creatorAddress,
        marketCap: coinData?.marketCap,
      }));
    } catch (error) {
      console.error("Error fetching coins:", error);
      throw error;
    }
  }

  /**
   * Gets a single coin by its address
   */
  async getCoin(address: string, chainId: number) {
    try {
      const response = await getCoin({ address, chain: chainId });

      if (!response.data?.zora20Token) {
        throw new Error("Coin not found");
      }

      return response.data.zora20Token;
    } catch (error) {
      console.error("Error fetching coin:", error);
      throw error;
    }
  }

  /**
   * Gets a profile by address
   */
  async getProfile(address: string) {
    try {
      const response = await getProfile({
        identifier: address,
      });

      if (!response.data?.profile) {
        throw new Error("Profile not found");
      }

      const profileData = response.data.profile;
      return {
        id: profileData?.id,
        handle: profileData?.handle,
        displayName: profileData?.displayName,
        bio: profileData?.bio,
        avatar: profileData?.avatar,
        username: profileData?.username,
        website: profileData?.website,
        publicWallet: profileData?.publicWallet,
        socialAccounts: profileData?.socialAccounts,
        linkedWallets: profileData?.linkedWallets,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  /**
   * Gets coins created by a profile
   */
  async getProfileCoins(address: string, chainId: number, count: number = 10, after?: string) {
    try {
      const response = await getProfileCoins({
        identifier: address,
        count,
        after,
        chainIds: [chainId],
      });

      if (!response.data?.profile) {
        throw new Error("Profile not found");
      }

      const profile = response.data.profile;
      const createdCoinsData = profile?.createdCoins;
      const createdCoins =
        createdCoinsData?.edges?.map((edge: any) => edge.node) || [];

      return {
        ...profile,
        createdCoins,
        createdCoinsCount: createdCoinsData?.count || 0,
        hasNextPage: createdCoinsData?.pageInfo?.hasNextPage || false,
        endCursor: createdCoinsData?.pageInfo?.endCursor || null,
      };
    } catch (error) {
      console.error("Error fetching profile coins:", error);
      throw error;
    }
  }
}
