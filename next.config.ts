import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack by default in Next.js 16+
  turbopack: {},
  
  transpilePackages: ['react-pdf'],
};

export default nextConfig;
