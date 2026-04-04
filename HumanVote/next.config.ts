import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['*.trycloudflare.com', '*.ngrok-free.dev'], // Add your dev origin here
  reactStrictMode: false,
};

export default nextConfig;
