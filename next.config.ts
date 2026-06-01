import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // DiceBear packages are pure ESM — skip bundling so Node loads them natively
  serverExternalPackages: ['@dicebear/core', '@dicebear/collection'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
