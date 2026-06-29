import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the multi-lockfile warning by explicitly declaring the workspace
  // root. Both Personal-Website/package.json (agents) and app/package.json
  // exist; Turbopack auto-picks the outer one, which is what we want.
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
