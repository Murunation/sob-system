/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev-only: avoid webpack PackFileCacheStrategy / vendor-chunks ENOENT when .next
  // is partially invalidated (e.g. clean while server was running). Production keeps default cache.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
}

export default nextConfig
