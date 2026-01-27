import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/storage.catbird.ai/**',
      },
      {
        protocol: 'https',
        hostname: '*.everart.ai',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.everart.ai https://storage.googleapis.com",
              "connect-src 'self' https://api.everart.ai",
              "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com",
              "media-src 'self' blob:",
              "frame-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// Made with Bob
