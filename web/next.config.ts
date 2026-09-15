import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next blocks cross-origin dev-server requests by default. Needed to test
  // OAuth callbacks (Instagram Business Login requires HTTPS, so a tunnel
  // like ngrok stands in for localhost during development) — remove or
  // tighten before shipping, this is dev-only.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app"],
  experimental: {
    // Default is 1MB — too small for a freshly-picked local photo sent to
    // generateDrafts() as a base64 data URI for vision-aware caption
    // generation. 12mb covers the app's existing 8MB image ceiling
    // (validateMedia() elsewhere) plus base64's ~37% size overhead.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
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
      {
        // YouTube channel thumbnails
        protocol: "https",
        hostname: "*.ggpht.com",
      },
      {
        // Pinterest profile images
        protocol: "https",
        hostname: "*.pinimg.com",
      },
      {
        // Bluesky avatars
        protocol: "https",
        hostname: "cdn.bsky.app",
      },
    ],
  },
};

export default nextConfig;
