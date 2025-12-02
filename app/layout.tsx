import type { Metadata } from "next";
import "./globals.css";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PreventZoom from "@/components/PreventZoom";

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Track your expenses easily with swipe gestures and detailed statistics",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Budget Tracker",
  },
  themeColor: "#1e293b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <PreventZoom />
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  );
}
