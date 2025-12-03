import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    resolveExtensions: [
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".json",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.groundguitar.com",
      },
      {
        protocol: "http",
        hostname: "s3.erentaskiran.com",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
