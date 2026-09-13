import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next blocks cross-origin dev-server requests by default. Needed to test
  // OAuth callbacks (Instagram Business Login requires HTTPS, so a tunnel
  // like ngrok stands in for localhost during development) — remove or
  // tighten before shipping, this is dev-only.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "*.tiktokcdn-us.com",
      },
      {
        // Instagram avatars (also covers Threads — same underlying CDN)
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        // Facebook Page avatars
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;
