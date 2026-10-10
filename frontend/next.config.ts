import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_E2E === "1" ? ".next-e2e" : ".next",
  experimental: {
    // Recompile on restart instead of reusing stale development CSS.
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        // Let Next.js preserve scoped class exports for CSS modules.
        condition: { not: { path: "*.module.css" } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
