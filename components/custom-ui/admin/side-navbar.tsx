import {
  ArrowUpRight,
  Bell,
  Blocks,
  ChartBar,
  Images,
  Palette,
  ShieldUser,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CTSCard } from "@/components/custom-ui/cts-card";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { AdminPageContent } from "@/lib/enums";
import { LogoutButton } from "../logout-button";
import { NavbarButton } from "./navbar-button";

interface SideNavbarProps {
  selectedPageContent: AdminPageContent;
  setSelectedPageContent: (pageContent: AdminPageContent) => void;
}

export const SideNavbar = ({
  selectedPageContent,
  setSelectedPageContent,
}: SideNavbarProps) => {
  const { executeLogout } = useAdminAuth();

  // Whether the page content is plugins, overlay, brand, analytics or notifications
  const isContentPlugins = selectedPageContent === AdminPageContent.PLUGINS;
  const isContentOverlay = selectedPageContent === AdminPageContent.OVERLAY;
  const isContentBrand = selectedPageContent === AdminPageContent.BRAND;
  const isContentAnalytics = selectedPageContent === AdminPageContent.ANALYTICS;
  const isContentNotifications =
    selectedPageContent === AdminPageContent.NOTIFICATIONS;

  // All the buttons appearing in the side navbar
  const navbarButtons = [
    {
      label: "Brand",
      icon: <Palette className="size-5" />,
      isSelected: isContentBrand,
      onClick: () => setSelectedPageContent(AdminPageContent.BRAND),
    },
    {
      label: "Plugins",
      icon: <Blocks className="size-5" />,
      isSelected: isContentPlugins,
      onClick: () => setSelectedPageContent(AdminPageContent.PLUGINS),
    },
    {
      label: "Overlay",
      icon: <Images className="size-5" />,
      isSelected: isContentOverlay,
      onClick: () => setSelectedPageContent(AdminPageContent.OVERLAY),
    },
    {
      label: "Analytics",
      icon: <ChartBar className="size-5" />,
      isSelected: isContentAnalytics,
      onClick: () => setSelectedPageContent(AdminPageContent.ANALYTICS),
    },
    {
      label: "Notifications",
      icon: <Bell className="size-5" />,
      isSelected: isContentNotifications,
      onClick: () => setSelectedPageContent(AdminPageContent.NOTIFICATIONS),
    },
  ];

  return (
    <CTSCard className="flex flex-col justify-between items-center h-full w-[264px] bg-card p-5">
      {/* Top section */}
      <div className="flex flex-col justify-center items-center w-full gap-10">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <Image
            src="/images/cts_logo.svg"
            alt="The Control The Stream logo"
            width={50}
            height={33}
            priority
            className="h-auto"
          />
          <ShieldUser className="size-6 text-foreground" />
        </div>

        {/* Admin buttons */}
        <div className="flex flex-col justify-center items-center w-full gap-2.5">
          {navbarButtons.map((button) => (
            <NavbarButton key={button.label} {...button} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-start gap-3 w-full">
        <Link
          href="/docs"
          target="_blank"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground underline transition-colors ml-1"
        >
          Docs
          <ArrowUpRight className="size-[18px]" />
        </Link>
        <LogoutButton executeLogout={executeLogout} />
      </div>
    </CTSCard>
  );
};
