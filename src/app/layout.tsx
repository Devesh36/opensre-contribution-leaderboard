import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { NavigationProvider } from "@/components/leaderboard/NavigationProvider";
import { SplashLoader } from "@/components/leaderboard/SplashLoader";
import { GIVEAWAY_SITE_ORIGIN } from "@/lib/giveaway/share";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(GIVEAWAY_SITE_ORIGIN),
  title: "Contributor Leaderboard | OpenSRE",
  description:
    "Contributor activity leaderboard for Tracer-Cloud/opensre.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full overflow-x-hidden antialiased`}
      suppressHydrationWarning
    >
      <body
        className="splash-pending min-h-full overflow-x-hidden"
        suppressHydrationWarning
      >
        <SplashLoader>
          <Suspense fallback={null}>
            <NavigationProvider>{children}</NavigationProvider>
          </Suspense>
        </SplashLoader>
      </body>
    </html>
  );
}
