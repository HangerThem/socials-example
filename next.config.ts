import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/media/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
