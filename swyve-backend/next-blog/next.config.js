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
};

module.exports = nextConfig;
