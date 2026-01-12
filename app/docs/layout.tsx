import Link from "next/link";
import { Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import type { Metadata } from "next";
import "./docs.css";

export const metadata: Metadata = {
  title: {
    default: "ControlTheStream Documentation",
    template: "%s - ControlTheStream Docs",
  },
  description:
    "Documentation for ControlTheStream - the interaction layer for your live streams on Base",
};

const navbar = (
  <div className="mobile-navbar-wrapper">
    <Navbar
      logo={
        <div className="navbar-logo flex items-center gap-2">
          <img
            src="/images/cts_logo.svg"
            alt="ControlTheStream"
            className="h-5"
          />
          <span className="font-bold text-lg text-white">ControlTheStream</span>
        </div>
      }
      projectLink="https://github.com/builders-garden/ControlTheStream"
    />
  </div>
);

const sidebarHeader = (
  <Link
    href="/docs"
    className="sidebar-logo group gap-2 px-4 border-b border-gray-800">
    <img
      src="/images/cts_logo.svg"
      alt="ControlTheStream"
      className="h-5 transition-opacity group-hover:opacity-80"
    />
    <span className="font-bold text-lg text-white transition-opacity group-hover:opacity-80">
      ControlTheStream
    </span>
  </Link>
);

const sidebarFooter = (
  <div className="sidebar-footer px-4 py-4">
    <p className="text-xs text-gray-400">
      Built with ❤️ on Base
    </p>
  </div>
);

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark docs-layout" data-theme="dark">
      {sidebarHeader}
      {sidebarFooter}
      <Layout
        navbar={navbar}
        pageMap={await getPageMap("/docs")}
        footer={null}
        editLink={null}
        feedback={{ content: null }}
        sidebar={{ defaultMenuCollapseLevel: 1 }}
        darkMode={false}>
        {children}
      </Layout>
    </div>
  );
}
