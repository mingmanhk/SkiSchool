/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/redirect-test',
        destination: '/test',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
