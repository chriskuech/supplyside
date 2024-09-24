/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.supplyside.io',
      },
    ],
  },
  webpack: (config, { isServer, dev }) =>
    isServer && !dev ? { ...config, devtool: 'source-map' } : config,
}

export default nextConfig
