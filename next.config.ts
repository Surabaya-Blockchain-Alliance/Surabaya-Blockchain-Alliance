/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true, 
  },
  webpack: (config, options) => {
    // Ensure WebAssembly is handled in both development and production
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Fallback for Node.js modules that don't exist in the browser
    if (!options.isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default nextConfig;
