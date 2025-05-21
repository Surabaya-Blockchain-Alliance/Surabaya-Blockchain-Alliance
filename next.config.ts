/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true, 
  },
  webpack: (config, options) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    if (!options.isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sapphire-managing-narwhal-834.mypinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**', 
      },
    ],
  },
};

export default nextConfig;
