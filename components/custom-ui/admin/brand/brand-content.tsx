import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BrandTabs } from "@/lib/enums";
import { AdminTabs } from "../admin-tabs";
import { AccessContent } from "./access/access-content";
import { HostsContent } from "./hosts/hosts-content";
import { InfoContent } from "./info/info-content";

export const BrandContent = () => {
  // Brand tabs states
  const [selectedTab, setSelectedTab] = useState<BrandTabs>(BrandTabs.INFO);

  // Whether the tab is info, access, or hosts
  const isInfoTab = selectedTab === BrandTabs.INFO;
  const isAccessTab = selectedTab === BrandTabs.ACCESS;
  const isHostsTab = selectedTab === BrandTabs.HOSTS;

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
            label: "Info",
            onClick: () => setSelectedTab(BrandTabs.INFO),
            isSelected: isInfoTab,
          },
          {
            label: "Access",
            onClick: () => setSelectedTab(BrandTabs.ACCESS),
            isSelected: isAccessTab,
          },
          {
            label: "Hosts",
            onClick: () => setSelectedTab(BrandTabs.HOSTS),
            isSelected: isHostsTab,
          },
        ]}
      />

      {/* Brand Content */}
      <AnimatePresence mode="wait">
        {isInfoTab && <InfoContent key="info" />}
        {isAccessTab && <AccessContent key="access" />}
        {isHostsTab && <HostsContent key="hosts" />}
      </AnimatePresence>
    </motion.div>
  );
};
