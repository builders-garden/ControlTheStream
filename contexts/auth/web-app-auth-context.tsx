import { createAppKit, useDisconnect } from "@reown/appkit/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { basePreconf } from "viem/chains";
import { useAccount, useSignMessage } from "wagmi";
import { useMiniApp } from "@/contexts/mini-app-context";
import {
  useAuthCheck,
  useLogout,
  useWebAppSignIn,
} from "@/hooks/use-auth-hooks";
import { useBrandBySlug } from "@/hooks/use-brands";
import { useCreatorCoins } from "@/hooks/use-creator-coin";
import { useFeaturedTokens } from "@/hooks/use-featured-tokens";
import { useTipSettings } from "@/hooks/use-tip-settings";
import {
  Brand,
  CreatorCoin,
  FeaturedToken,
  TipSettings,
} from "@/lib/database/db.schema";
import { AuthTokenType } from "@/lib/enums";
import { wagmiAdapter } from "@/lib/reown";
import { User } from "@/lib/types/user.type";
import { env } from "@/lib/zod";

interface WebAppAuthContextType {
  user: {
    data: User | undefined;
    refetch: () => Promise<void>;
  };
  brand: {
    brandSlug: string | undefined;
    setBrandSlug: (brandSlug: string) => void;
    data: Brand | undefined;
    refetch: () => Promise<void>;
    tipSettings: {
      data: TipSettings | undefined;
      refetch: () => Promise<void>;
    };
    featuredTokens: {
      data: FeaturedToken[];
      refetch: () => Promise<void>;
    };
    creatorCoin: {
      data: CreatorCoin | undefined;
      refetch: () => Promise<void>;
    };
  };
  signInWithWebApp: () => void;
  executeLogout: () => void;
  isSigningIn: boolean;
  isLoggingOut: boolean;
  sideBarLoading: boolean;
  isLoading: boolean;
  error: Error | null;
}

const WebAppAuthContext = createContext<WebAppAuthContextType | undefined>(
  undefined,
);

// Set up metadata
const metadata = {
  name: "Control The Stream",
  description: "Control The Stream",
  url: env.NEXT_PUBLIC_URL,
  icons: [],
};

// Create the modal at module level
createAppKit({
  adapters: [wagmiAdapter],
  projectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [basePreconf],
  metadata,
  defaultNetwork: basePreconf,
  features: {
    analytics: true,
    connectMethodsOrder: ["wallet"],
  },
});

export const useWebAppAuth = () => {
  const context = useContext(WebAppAuthContext);
  if (!context) {
    throw new Error("useWebAppAuth must be used within an WebAppAuthProvider");
  }
  return context;
};

export const WebAppAuthProvider = ({ children }: { children: ReactNode }) => {
  // Environment context
  const { isLoading: isEnvironmentLoading } = useMiniApp();

  // Local state
  const [brandSlug, setBrandSlug] = useState<string>();
  const [brand, setBrand] = useState<Brand>();
  const [tipSettings, setTipSettings] = useState<TipSettings>();
  const [featuredTokens, setFeaturedTokens] = useState<FeaturedToken[]>([]);
  const [creatorCoin, setCreatorCoin] = useState<CreatorCoin>();
  const [user, setUser] = useState<User>();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { signMessage } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { address: connectedAddress } = useAccount();

  // Single user query - this is the only place we fetch user data
  // Always try to fetch on load to check for existing valid token
  const { user: authUser, refetch: refetchUser } = useAuthCheck(
    AuthTokenType.WEB_APP_AUTH_TOKEN,
  ); // Always fetch to check for existing token

  // Fetching the brand when the user is connected
  const {
    data: brandData,
    isLoading: isFetchingBrand,
    error: brandError,
    refetch: refetchBrand,
  } = useBrandBySlug({
    brandSlug,
    enabled: !!brandSlug,
  });

  // Fetching the tip settings when the brand is connected
  const {
    data: tipSettingsData,
    isLoading: isFetchingTipSettings,
    error: tipSettingsError,
    refetch: refetchTipSettings,
  } = useTipSettings({
    brandId: brand?.id,
    enabled: !!brand?.id,
  });

  // Fetching the featured tokens when the brand is connected
  const {
    data: featuredTokensData,
    isLoading: isFetchingFeaturedTokens,
    error: featuredTokensError,
    refetch: refetchFeaturedTokens,
  } = useFeaturedTokens({
    brandId: brand?.id,
    enabled: !!brand?.id,
  });

  // Fetching the creator coin when the brand is connected
  const {
    data: creatorCoinsData,
    isLoading: isFetchingCreatorCoin,
    error: creatorCoinError,
    refetch: refetchCreatorCoins,
  } = useCreatorCoins(brand?.id, !!brand?.id);

  // Auto set user logic
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // Auto set brand logic
  useEffect(() => {
    if (brandData && brandData.data) {
      setBrand(brandData.data);
    }
  }, [brandData]);

  // Auto set tip settings logic
  useEffect(() => {
    if (tipSettingsData && tipSettingsData.data) {
      setTipSettings(tipSettingsData.data);
    }
  }, [tipSettingsData]);

  // Auto set featured tokens logic
  useEffect(() => {
    if (featuredTokensData && featuredTokensData.data) {
      setFeaturedTokens(featuredTokensData.data as FeaturedToken[]);
    }
  }, [featuredTokensData]);

  // Auto set creator coin logic
  useEffect(() => {
    if (creatorCoinsData && creatorCoinsData.data) {
      // Only take the first creator coin (since we only allow 1)
      setCreatorCoin(creatorCoinsData.data[0]);
    } else {
      setCreatorCoin(undefined);
    }
  }, [creatorCoinsData]);

  // Handles the refetching of the brand
  const executeRefetchBrand = useCallback(async () => {
    const newBrand = await refetchBrand();
    if (newBrand.isSuccess && newBrand.data?.data) {
      setBrand(newBrand.data.data);
    }
  }, [refetchBrand]);

  // Handles the refetching of the user
  const executeRefetchUser = useCallback(async () => {
    const newUser = await refetchUser();
    if (newUser.isSuccess && newUser.data?.user) {
      setUser(newUser.data.user);
    }
  }, [refetchUser]);

  // Handles the refetching of the tip settings
  const executeRefetchTipSettings = useCallback(async () => {
    const newTipSettings = await refetchTipSettings();
    if (newTipSettings.isSuccess && newTipSettings.data?.data) {
      setTipSettings(newTipSettings.data.data);
    }
  }, [refetchTipSettings]);

  // Handles the refetching of the featured tokens
  const executeRefetchFeaturedTokens = useCallback(async () => {
    const newFeaturedTokens = await refetchFeaturedTokens();
    if (newFeaturedTokens.isSuccess && newFeaturedTokens.data?.data) {
      setFeaturedTokens(newFeaturedTokens.data.data as FeaturedToken[]);
    }
  }, [refetchFeaturedTokens]);

  // Handles the refetching of the creator coin
  const executeRefetchCreatorCoin = useCallback(async () => {
    const newCreatorCoins = await refetchCreatorCoins();
    if (newCreatorCoins.isSuccess && newCreatorCoins.data?.data) {
      setCreatorCoin(newCreatorCoins.data.data[0]);
    } else {
      setCreatorCoin(undefined);
    }
  }, [refetchCreatorCoins]);

  // Logout mutation
  const { mutate: logout } = useLogout({
    onSuccess: async () => {
      setUser(undefined);
      await disconnect();
      setIsLoggingOut(false);
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    },
  });

  // A function to logout
  const executeLogout = useCallback(() => {
    setIsLoggingOut(true);
    logout({ tokenType: AuthTokenType.WEB_APP_AUTH_TOKEN });
  }, [logout]);

  // Web app sign-in mutation
  const { mutate: webAppSignIn } = useWebAppSignIn({
    onSuccess: (data) => {
      console.log("Web app sign-in success:", data);
      if (data.success && data.user) {
        setIsSigningIn(false);
        setError(null);
        setUser(data.user);
      }
    },
    onError: (error: Error) => {
      console.log("Web app sign-in error:", error);
      setError(error);
      setIsSigningIn(false);
    },
  });

  // Handles the sign-in with web app
  const executeSignInWithWebApp = useCallback(() => {
    if (!connectedAddress) return;
    setIsSigningIn(true);

    // The message to sign
    const message = "Sign in to the control the stream app";

    // Request a signature to the user
    signMessage(
      {
        message,
      },
      {
        onSuccess: (data) => {
          // If the signature was produced, sign in with the web app
          webAppSignIn(
            {
              signature: data,
              address: connectedAddress,
              message,
            },
            {
              onSuccess: async () => {
                await executeRefetchUser();
                toast.success("Successfully logged in");
                setIsSigningIn(false);
              },
              onError: () => {
                toast.error("Failed to log in");
                setIsSigningIn(false);
              },
            },
          );
        },
        onError: () => {
          toast.error("Signature rejected");
          setIsSigningIn(false);
        },
      },
    );
  }, [webAppSignIn, signMessage, connectedAddress]);

  const value: WebAppAuthContextType = {
    user: {
      data: user,
      refetch: executeRefetchUser,
    },
    brand: {
      data: brand,
      brandSlug,
      setBrandSlug,
      refetch: executeRefetchBrand,
      tipSettings: {
        data: tipSettings,
        refetch: executeRefetchTipSettings,
      },
      featuredTokens: {
        data: featuredTokens,
        refetch: executeRefetchFeaturedTokens,
      },
      creatorCoin: {
        data: creatorCoin,
        refetch: executeRefetchCreatorCoin,
      },
    },
    isLoggingOut,
    executeLogout,
    signInWithWebApp: executeSignInWithWebApp,
    isSigningIn,
    sideBarLoading:
      isFetchingTipSettings ||
      isFetchingFeaturedTokens ||
      isFetchingCreatorCoin,
    isLoading: isEnvironmentLoading || isFetchingBrand,
    error:
      error ||
      brandError ||
      tipSettingsError ||
      featuredTokensError ||
      creatorCoinError,
  };

  return (
    <WebAppAuthContext.Provider value={value}>
      {children}
    </WebAppAuthContext.Provider>
  );
};
