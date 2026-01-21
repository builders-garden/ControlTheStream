import { Loader2, Signature } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Address } from "viem";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { useCreateAdmin } from "@/hooks/use-admins";
import { useCreateBrand } from "@/hooks/use-brands";
import { useCreateTipSettings } from "@/hooks/use-tip-settings";
import { AuthTokenType } from "@/lib/enums";
import { slugify } from "@/lib/utils";
import { env } from "@/lib/zod";
import { CTSButton } from "../cts-button";

export const SignUpContent = () => {
  const [brandName, setBrandName] = useState("");
  const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false);

  const { mutate: createBrand } = useCreateBrand(
    AuthTokenType.ADMIN_AUTH_TOKEN,
  );
  const { mutate: createAdmin } = useCreateAdmin(
    AuthTokenType.ADMIN_AUTH_TOKEN,
  );
  const { mutate: createTipSettings } = useCreateTipSettings(
    AuthTokenType.ADMIN_AUTH_TOKEN,
  );
  const { brand, admin: connectedAdmin } = useAdminAuth();

  // Slugified version of the brand name
  const slugifiedBrandName = useMemo(() => {
    return slugify(brandName);
  }, [brandName]);

  // Handles the create brand button click
  const handleCreateBrand = async () => {
    if (isCreatingNewBrand || !brandName || !connectedAdmin.address) return;
    setIsCreatingNewBrand(true);

    // Create the brand
    createBrand(
      {
        name: brandName.trim(),
        slug: slugifiedBrandName,
        isActive: true,
      },
      {
        onSuccess: async (response) => {
          // On brand creations success, call the create admin mutation
          createAdmin(
            {
              address: connectedAdmin.address as Address,
              baseName: connectedAdmin.baseName,
              ensName: connectedAdmin.ensName,
              brandId: response.data.id,
            },
            {
              onSuccess: async () => {
                // On admin creations success, call the create tip settings mutation
                createTipSettings(
                  {
                    brandId: response.data.id,
                    payoutAddress: connectedAdmin.address as Address,
                    payoutBaseName: connectedAdmin.baseName,
                    payoutEnsName: connectedAdmin.ensName,
                  },
                  {
                    onSuccess: async () => {
                      await brand.refetch();
                      setIsCreatingNewBrand(false);
                      toast.success("Brand created successfully");
                    },
                    onError: () => {
                      toast.error("Error while creating tip settings");
                      setIsCreatingNewBrand(false);
                    },
                  },
                );
              },
              onError: () => {
                toast.error("Error while creating admin");
                setIsCreatingNewBrand(false);
              },
            },
          );
        },
        onError: () => {
          toast.error("Error while creating brand");
          setIsCreatingNewBrand(false);
        },
      },
    );
  };

  return (
    <motion.div
      key="create-brand-process"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex justify-center items-center w-full min-h-screen">
      <div className="flex flex-col items-center justify-center w-[60%] gap-10">
        <div className="flex flex-col gap-7 w-full">
          <h1 className="text-6xl font-bold text-center">
            Create your new brand
          </h1>
          <p className="text-lg opacity-50 -mt-2 text-center">
            Give your brand some details and start managing and integrating web3
            native plugins in your stream.
            <br />
            Don&apos;t worry, you can always change these details later
          </p>
        </div>

        <div className="flex flex-col gap-8 w-[70%]">
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col justify-start items-start gap-2.5 w-full">
              {/* Label */}
              <div className="flex justify-start items-center gap-2.5">
                <Signature className="size-5 text-muted-foreground" />
                <p className="text-base font-bold text-muted-foreground">
                  Brand Name
                </p>
              </div>

              <div className="flex w-full justify-start items-center gap-2.5 rounded-[12px] border-muted border-[1px] ring-muted-foreground/40 px-5 py-2.5 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Your brand's name here..."
                  disabled={isCreatingNewBrand}
                  className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-base"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                  }}
                />
              </div>
            </div>

          </div>

          <motion.div
            key="brand-name-slug"
            initial={{ opacity: 0, height: 0, marginBottom: "-32px" }}
            animate={{
              opacity: slugifiedBrandName ? 1 : 0,
              height: slugifiedBrandName ? "58px" : 0,
              marginBottom: slugifiedBrandName ? 0 : "-32px",
              transition: {
                height: {
                  delay: slugifiedBrandName ? 0 : 0.25,
                },
                opacity: {
                  delay: slugifiedBrandName ? 0.25 : 0,
                },
                marginBottom: {
                  delay: slugifiedBrandName ? 0 : 0.25,
                },
              },
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col justify-between items-center w-full gap-2">
            <h1 className="text-xl font-bold">Your brand link:</h1>
            <p className="text-base">
              {env.NEXT_PUBLIC_URL}/<b>{slugifiedBrandName}</b>
            </p>
          </motion.div>

          <CTSButton
            variant="success"
            className="w-full h-[42px]"
            disabled={isCreatingNewBrand || !brandName}
            onClick={handleCreateBrand}>
            <AnimatePresence mode="wait">
              {isCreatingNewBrand ? (
                <motion.div
                  key="creating-brand-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <Loader2 className="size-5 text-foreground animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="create-brand-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <p className="text-base font-bold text-foreground">
                    Create Brand
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CTSButton>
        </div>
      </div>
    </motion.div>
  );
};
