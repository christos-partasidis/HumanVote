import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['*.trycloudflare.com', '*.ngrok-free.dev'],
  reactStrictMode: false,
};

export default nextConfig;
