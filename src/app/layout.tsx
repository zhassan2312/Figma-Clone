import "../styles/globals.css";

import { Inter } from "next/font/google";
import { type Metadata, type Viewport } from "next";
import OfflineWarning from "../components/OfflineWarning";
import PWAInstaller from "../components/PWAInstaller";
import SessionProvider from "../components/SessionProvider";
import { LoadingProvider } from "../components/LoadingProvider";
import { NavigationLoader } from "../components/NavigationLoader";

export const metadata: Metadata = {
  title: "Figma",
  description: "Figma",
  icons: [{ rel: "icon", url: "/figma-logo.ico" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.className}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Figma" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/figma-logo.ico" />
      </head>
      <body className="overflow-hidden overscroll-none">
        <SessionProvider>
          <LoadingProvider>
            <NavigationLoader />
            <PWAInstaller />
            <OfflineWarning />
            {children}
          </LoadingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}