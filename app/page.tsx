import { Metadata } from "next";
import App from "@/components/pages/App/app";
import { THE_ROLLUP_BRAND_SLUG } from "@/lib/constants";
import { env } from "@/lib/zod";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata(): Promise<Metadata> {
  const miniapp = {
    version: "next",
    imageUrl: `${appUrl}/images/feed.png`,
    button: {
      title: "Watch the Stream",
      action: {
        type: "launch_frame",
        name: "Control The Stream",
        url: appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };
  return {
    title: "Control The Stream",
    description: "Turn viewing into action",
    metadataBase: new URL(appUrl),
    openGraph: {
      title: "Control The Stream",
      description: "Turn viewing into action",
      type: "website",
      images: [
        {
          url: `${appUrl}/feed.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Control The Stream",
      description: "Turn viewing into action",
      siteId: "1727435024931094528",
      creator: "@builders_garden",
      creatorId: "1727435024931094528",
      images: [`${appUrl}/feed.png`],
    },
    other: {
      "fc:miniapp": JSON.stringify(miniapp),
      "base:app_id": env.NEXT_PUBLIC_BASE_APP_ID,
    },
  };
}

export default function Home() {
  return <App brandSlug={THE_ROLLUP_BRAND_SLUG} />;
}
