import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@prompt-ops/shared', '@prompt-ops/db'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
