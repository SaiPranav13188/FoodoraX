/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables standalone build mode for optimized Vercel deployments
  output: 'standalone',

  // Optional: Allows loading images from external domains if your API returns remote image URLs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;