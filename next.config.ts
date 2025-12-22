import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    urlImports: ['https://framer.com/m/', 'https://framerusercontent.com/'],
  },
};

export default nextConfig;
