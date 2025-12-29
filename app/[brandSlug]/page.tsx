import { Metadata } from "next";
import App from "@/components/pages/App/app";
import { env } from "@/lib/zod";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ brandSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { brandSlug } = await params;
  const _searchParams = await searchParams;
  const searchParamsString = Object.entries(_searchParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const buttonTitle = "Watch the Stream";
  const ogImageUrl = brandSlug
    ? `${appUrl}/api/og/brand/${brandSlug}`
    : `${appUrl}/images/feed.png`;
  const farcasterImageUrl = brandSlug
    ? `${appUrl}/api/og/brand/${brandSlug}?ar=3x2`
    : `${appUrl}/images/feed.png`;

  const miniapp = {
    version: "next",
    imageUrl: farcasterImageUrl,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_frame",
        name: "Control The Stream",
        url: `${appUrl}/${brandSlug}${searchParamsString ? `?${searchParamsString}` : ""}`,
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
          url: ogImageUrl,
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
      images: [ogImageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(miniapp),
      "base:app_id": env.NEXT_PUBLIC_BASE_APP_ID,
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  const { brandSlug } = await params;
  return <App brandSlug={brandSlug} />;
}
