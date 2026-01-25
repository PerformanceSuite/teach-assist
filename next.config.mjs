/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy API requests to backend during development
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8002/api/v1/:path*',
      },
      {
        source: '/health',
        destination: 'http://localhost:8002/health',
      },
    ];
  },
};
export default nextConfig;
