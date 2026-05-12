/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    typedRoutes: true,
    optimizeCss: true, // inline critical CSS via `critters` (devDep)
  },
};

export default nextConfig;
