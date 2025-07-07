import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore eslint errors during build
  },
  // Turbopack configuration (now stable)
  turbopack: {
    // Configure turbopack if needed
  },
  /* config options here */
};

// Create final config - only apply PWA in production
let finalConfig = nextConfig;

if (process.env.NODE_ENV === "production") {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
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
    buildExcludes: [/middleware-manifest.json$/],
    publicExcludes: ["!noprecache/**/*"],
  });
  
  finalConfig = withPWA(nextConfig);
}

export default finalConfig;
