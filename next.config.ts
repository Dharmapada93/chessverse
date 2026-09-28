import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Disable Next.js development indicator ("N" button)
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://chessverse-backend-g26z.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
