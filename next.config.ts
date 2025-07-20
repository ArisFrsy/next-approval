import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/next",
  assetPrefix: "/next",
  images: {
    unoptimized: true,
    domains: [], // kosongkan jika pakai gambar lokal
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "otobos.alfahuma.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Aktifkan trailingSlash agar path publik bekerja konsisten
  trailingSlash: true,

  // Optional: Jika kamu pakai strict mode atau SWC
  reactStrictMode: true,
};

export default nextConfig;
