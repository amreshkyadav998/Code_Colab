import { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {}, // It should be an object, not a boolean
  },
};

export default nextConfig;
