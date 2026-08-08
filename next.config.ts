import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.kowsik.me',
          },
        ],
        destination: 'https://kowsik.me/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/image",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
