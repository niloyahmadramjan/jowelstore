import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // for images config option 1
  // images: {
  //   domains: ['placehold.co']
  // }

  // for images config option 2
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
