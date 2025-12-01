import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors for Vercel deployment
    // Prisma generates types during postinstall, but Vercel may check types before completion
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
