import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['*.trycloudflare.com', '*.ngrok-free.dev'], // Add your dev origin here
  reactStrictMode: false,
  serverExternalPackages: ['@libsql/client', 'libsql', '@prisma/adapter-libsql'],
};

export default nextConfig;
