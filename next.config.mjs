/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Optimize for production deployment
  compress: true,

  // Reduce bundle size for containerization
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
