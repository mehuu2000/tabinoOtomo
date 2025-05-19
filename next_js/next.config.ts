// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

const nextConfig = {
  experimental: {
    serverActions: {},
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'res.cloudinary.com', 'yyjfaadcuvgnzapipczd.supabase.co'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Large-Allocation',
            value: 'true'
          }
        ],
      },
    ]
  }
}

module.exports = nextConfig
