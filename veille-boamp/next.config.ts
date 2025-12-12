import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone pour Docker
  output: "standalone",

  // Optimisations d'images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Variables d'environnement exposées côté client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Désactiver les headers X-Powered-By
  poweredByHeader: false,

  // Configuration expérimentale pour server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
