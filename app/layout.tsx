import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import localFont from "next/font/local";
import Providers from "@/app/providers";
import "./globals.css";
import { headers } from "next/headers";
import { MiniAppProvider } from "@/contexts/mini-app-context";
import { env } from "@/lib/zod";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});

const overusedGrotesk = localFont({
  src: "./fonts/overused-grotesk.woff2",
  variable: "--font-overused-grotesk",
});

export const metadata: Metadata = {
  title: "Control The Stream",
  description: "Turn viewing into action",
  other: {
    "base:app_id": env.NEXT_PUBLIC_BASE_APP_ID,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} ${overusedGrotesk.variable} font-nunito-sans size-full antialiased bg-background text-foreground`}>
        <MiniAppProvider>
          <Providers cookies={cookies}>{children}</Providers>
        </MiniAppProvider>
      </body>
    </html>
  );
}
