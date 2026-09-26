import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // R1.28: Disable Next.js development indicator ("N" button)
  devIndicators: false,
};

export default nextConfig;
