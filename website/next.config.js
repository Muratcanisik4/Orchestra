/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'orchestra-backend.onrender.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://orchestra-backend.onrender.com/:path*',
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://orchestra-backend.onrender.com',
  },
}

module.exports = nextConfig 