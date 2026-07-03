import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from the public folder (local) without restrictions
    unoptimized: false,
  },
};

export default nextConfig;
