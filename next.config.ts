import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"], // ← moved out of experimental

  /* config options here */
};

export default nextConfig;
