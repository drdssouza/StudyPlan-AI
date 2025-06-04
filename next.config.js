/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Amplify Hosting
  output: 'export',
  trailingSlash: true,
  
  // Otimização de imagens para Amplify
  images: {
    domains: ['localhost'],
    unoptimized: true // Necessário para Amplify
  },
  
  // Webpack config para resolver dependências no browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Headers para CORS (se necessário)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  // Redirects se necessário
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;