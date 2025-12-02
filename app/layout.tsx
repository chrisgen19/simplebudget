import type { Metadata } from "next";
import "./globals.css";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  );
}
