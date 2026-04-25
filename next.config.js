/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/bodycoaching',
  assetPrefix: '/bodycoaching',
  trailingSlash: true,
  images: { unoptimized: true },
}
module.exports = nextConfig
