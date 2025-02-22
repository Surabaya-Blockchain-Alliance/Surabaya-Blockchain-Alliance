/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, 
  typescript: {
    ignoreBuildErrors: true, 
  },
  webpack: function (config: any, options: any) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
