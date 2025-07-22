/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Optimize for production deployment
  compress: true,
  
  // Enable experimental features that help with containerization
  experimental: {
    // Reduce bundle size
    outputFileTracingRoot: process.cwd(),
  },
};

export default nextConfig;
