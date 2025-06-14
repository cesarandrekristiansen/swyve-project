/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blog.swyve.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_WP_API: process.env.NEXT_PUBLIC_WP_API,
  },
  async rewrites() {
    return [
      {
        source: '/blog/:path*',
        destination: 'https://swyve-backend.onrender.com/blog/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
