/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'orchestra-hoa7.onrender.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://orchestra-hoa7.onrender.com/:path*',
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://orchestra-hoa7.onrender.com',
  },
}

module.exports = nextConfig 