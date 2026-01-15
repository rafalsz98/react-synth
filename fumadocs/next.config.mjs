import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const isProd = process.env.NODE_ENV === "production";
const repoName = "react-synth";

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true, // /docs → /docs/ (prevents 404)
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `https://rafalsz98.github.io/${repoName}/` : "", // Full URL for _next/ assets

  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
