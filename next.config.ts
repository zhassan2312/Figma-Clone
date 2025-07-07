import type { NextConfig } from "next";
import {env} from "./src/env";

const isDev = env.NODE_ENV === "development";
const isProd = env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Only configure webpack for production builds
  ...(!isDev && {
    webpack: (config) => {
      return config;
    },
  }),
  experimental: {
    // Ensure turbopack works properly
    turbo: {
      rules: {},
    },
  },
};

// Apply PWA only in production
let finalConfig = nextConfig;

if (isProd) {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: isDev, // Explicitly disable in development
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
