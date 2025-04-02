/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable API proxy for now since we're using mock data
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:8000/:path*',
  //     },
  //   ]
  // },
}

module.exports = nextConfig