import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Only include runtime caching in production
  ...(process.env.NODE_ENV === "production" && {
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  }),
  buildExcludes: [/middleware-manifest.json$/],
  // Exclude problematic files from caching
  publicExcludes: ["!noprecache/**/*"],
});

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore eslint errors during build
  },
  /* config options here */
};

export default withPWA(nextConfig);
