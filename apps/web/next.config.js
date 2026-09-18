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

  // Proxies frontend /api requests directly to your live Render backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://foodorax-2vgu.onrender.com',
      },
    ];
  },
};

module.exports = nextConfig;