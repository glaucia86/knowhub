/** @type {import('next').NextConfig} */
const useRelaxedWebBuild = process.env.KNOWHUB_RELAX_WEB_BUILD === '1';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: useRelaxedWebBuild,
  },
  typescript: {
    ignoreBuildErrors: useRelaxedWebBuild,
  },
};

export default nextConfig;
