import type { NextConfig } from "next";

// Admin (`*.dev.tsx` routes + Server Actions) exists only in `next dev`.
// The published site stays a pure static export with no admin routes.
const dev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: dev ? undefined : "export",
  pageExtensions: dev ? ["dev.tsx", "tsx", "ts"] : ["tsx", "ts"],
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
