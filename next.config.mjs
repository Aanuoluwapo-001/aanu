/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth", "tesseract.js", "pdf-to-img"],
  },
};
export default nextConfig;
