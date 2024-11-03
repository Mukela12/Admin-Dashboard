import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**", // Allows any path under firebasestorage.googleapis.com
      },
    ],
  },
  /* other config options here */
};

export default nextConfig;
