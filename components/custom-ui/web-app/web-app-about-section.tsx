import { ChevronDownIcon, Globe, Send, Twitch, Youtube } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { useHostsByBrandId } from "@/hooks/use-hosts";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HostsSection } from "../mini-app/hosts-section";
import { NewsletterCTA } from "../newsletter-cta";

interface LinksProps {
  youtubeUrl?: string;
  twitchUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  className?: string;
  brandSlug?: string;
}

// A component that displays the links to the social media platforms
const Links = ({
  youtubeUrl,
  twitchUrl,
  twitterUrl,
  websiteUrl,
  telegramUrl,
  className,
  brandSlug,
}: LinksProps) => {
  return (
    <div
      className={cn(
        "flex justify-end items-center gap-3.5 shrink-0",
        className,
      )}>
      {youtubeUrl && (
        <Link
          href={youtubeUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Youtube className="size-7" strokeWidth={1.8} />
        </Link>
      )}
      {twitchUrl && (
        <Link
          href={twitchUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Twitch className="size-6" />
        </Link>
      )}
      {twitterUrl && (
        <Link
          href={twitterUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Image
            src={
              brandSlug === THE_ROLLUP_BRAND_SLUG
                ? "/socials/x_logo_black.svg"
                : "/socials/x_logo_white.svg"
            }
            alt="X"
            width={20}
            height={20}
          />
        </Link>
      )}
      {websiteUrl && (
        <Link
          href={websiteUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Globe className="size-6" />
        </Link>
      )}
      {telegramUrl && (
        <Link
          href={telegramUrl}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <Send className="size-6" />
        </Link>
      )}
    </div>
  );
};

interface WebAppAboutSectionProps {
  label: string;
  text: string;
  coverUrl?: string;
  youtubeUrl?: string;
  twitchUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  brandSlug?: string;
  brandId?: string;
}

export const WebAppAboutSection = ({
  label,
  text,
  coverUrl,
  youtubeUrl,
  twitchUrl,
  twitterUrl,
  websiteUrl,
  telegramUrl,
  brandSlug,
  brandId,
}: WebAppAboutSectionProps) => {
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined,
  );

  const { data: hosts, isLoading: isLoadingHosts } = useHostsByBrandId({
    brandId: brandId,
    enabled: !!brandId,
  });

  // Set accordion to open by default on mobile, closed on desktop
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        const isMobile = window.innerWidth < 768; // md breakpoint
        setAccordionValue(isMobile ? "item-1" : undefined);
      }
    };

    // Set initial value
    checkMobile();

    // Update on resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!text && !coverUrl) {
    return (
      <Links
        youtubeUrl={youtubeUrl}
        twitchUrl={twitchUrl}
        twitterUrl={twitterUrl}
        websiteUrl={websiteUrl}
        className="w-full"
      />
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionValue}
      onValueChange={setAccordionValue}>
      <AccordionItem value="item-1" className="border-0">
        <AccordionTrigger
          className="w-full cursor-pointer py-2 md:py-4"
          hideChevron>
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-start items-center gap-2.5 w-full">
              <h1 className="text-base md:text-lg font-bold">{label}</h1>
              <motion.div
                initial={{ rotate: 180 }}
                animate={{ rotate: !!accordionValue ? 180 : 0 }}
                transition={{ duration: 0.2 }}>
                <ChevronDownIcon className="text-muted-foreground size-5 md:size-6 shrink-0" />
              </motion.div>
            </div>
            <Links
              youtubeUrl={youtubeUrl}
              twitchUrl={twitchUrl}
              twitterUrl={twitterUrl}
              websiteUrl={websiteUrl}
              telegramUrl={telegramUrl}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col justify-between items-start w-full gap-4 md:gap-6 my-2 focus-visible:outline-none data-[state=closed]:!pb-0 data-[state=closed]:!my-0 data-[state=closed]:!pt-0">
          <div className="flex flex-col md:flex-row justify-between items-start w-full gap-4 md:gap-10">
            {coverUrl && (
              <Image
                src={coverUrl}
                alt="Cover"
                className="h-[200px] md:h-[250px] w-full md:w-auto object-cover rounded-[12px]"
                width={1000}
                height={200}
              />
            )}
            <div className="flex flex-1 flex-col justify-between items-start w-full gap-4 md:gap-0 min-h-[200px] md:h-[250px]">
              {text && (
                <div className="flex flex-col justify-start items-start gap-2">
                  <h1 className="text-base md:text-lg font-bold">
                    What happens here?
                  </h1>
                  <p className="text-sm md:text-lg w-full text-start">{text}</p>
                </div>
              )}

              <div className="flex justify-between items-center w-full pr-2 gap-5">
                <AnimatePresence mode="wait">
                  {isLoadingHosts ? (
                    <motion.div
                      key="loading-hosts"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full">
                      <Skeleton className="w-full bg-black/10 h-[122px]" />
                    </motion.div>
                  ) : hosts?.data && hosts?.data.length > 0 ? (
                    <motion.div
                      key="hosts-section"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-1 justify-start items-center">
                      <HostsSection
                        hosts={hosts?.data || []}
                        label="Hosts"
                        labelClassName="text-lg font-bold"
                        hostNameClassName="text-sm font-bold"
                        fromWebApp
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Newsletter CTA */}
                {brandSlug === THE_ROLLUP_BRAND_SLUG && (
                  <NewsletterCTA
                    label="Subscribe to newsletter"
                    labelClassName="text-lg"
                    className="w-[50%]"
                    brandSlug={brandSlug}
                  />
                )}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
