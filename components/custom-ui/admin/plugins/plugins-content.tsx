import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PluginsTabs } from "@/lib/enums";
import { AdminTabs } from "../admin-tabs";
import { KalshiContent } from "./kalshi/kalshi-content";
import { SentimentContent } from "./sentiment/sentiment-content";
import { TipsContent } from "./tips/tips-content";
import { TokensContent } from "./tokens/tokens-content";

export const PluginsContent = ({ brandId }: { brandId: string }) => {
  const [selectedTab, setSelectedTab] = useState<PluginsTabs>(PluginsTabs.TIPS);

  // Whether the tab is tips, tokens, sentiments or kalshi
  const isTipsTab = selectedTab === PluginsTabs.TIPS;
  const isTokensTab = selectedTab === PluginsTabs.TOKENS;
  const isSentimentTab = selectedTab === PluginsTabs.SENTIMENT;
  const isKalshiTab = selectedTab === PluginsTabs.KALSHI;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-center w-full">
      {/* Tabs Buttons */}
      <AdminTabs
        tabButtons={[
          {
            label: "Tips",
            onClick: () => setSelectedTab(PluginsTabs.TIPS),
            isSelected: isTipsTab,
          },
          {
            label: "Sentiment",
            onClick: () => setSelectedTab(PluginsTabs.SENTIMENT),
            isSelected: isSentimentTab,
          },
          {
            label: "Tokens",
            onClick: () => setSelectedTab(PluginsTabs.TOKENS),
            isSelected: isTokensTab,
          },
          {
            label: "Kalshi",
            onClick: () => setSelectedTab(PluginsTabs.KALSHI),
            isSelected: isKalshiTab,
          },
        ]}
      />

      {/* Plugins Content */}
      <AnimatePresence mode="wait">
        {isTipsTab && <TipsContent key="tips" />}
        {isSentimentTab && (
          <SentimentContent key="sentiment" brandId={brandId} />
        )}
        {isTokensTab && <TokensContent key="tokens" />}
        {isKalshiTab && <KalshiContent key="kalshi" />}
      </AnimatePresence>
    </motion.div>
  );
};
