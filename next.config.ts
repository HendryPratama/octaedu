import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mengabaikan error tipe data saat build di Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;