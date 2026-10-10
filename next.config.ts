import type { NextConfig } from "next";

const esDesarrollo = process.env.NODE_ENV !== "production";

const cspEstricta = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ""} https://iasm-pulse.vercel.app`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://unpkg.com https://*.tile.openstreetmap.org https://iasm-pulse.vercel.app",
  "font-src 'self' data:",
  "connect-src 'self' https://iasm-pulse.vercel.app",
  "worker-src 'self'",
  "manifest-src 'self'",
].join("; ");

const cspBasica = [
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspBasica },
          { key: "Content-Security-Policy-Report-Only", value: cspEstricta },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), geolocation=(self), microphone=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
