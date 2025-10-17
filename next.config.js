/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Статический экспорт для хостинга
  output: 'export',
  trailingSlash: true,
  // Оптимизации для Lighthouse
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Исключаем папку edge-functions из сборки Next.js
  webpack: (config) => {
    config.ignoreWarnings = [
      { message: /edge-functions/ },
      { message: /Critical dependency/ }
    ];
    
    // Оптимизация бандла - более агрессивное разделение
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Supabase отдельно (большая библиотека)
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 20,
          },
          // UI библиотеки отдельно
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|sonner)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
          // Остальные vendor библиотеки
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    };
    
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gqnwyyinswqoustiqtpk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Агрессивная оптимизация изображений
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 год
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Redirects are handled at DNS/hosting level
  // No application-level redirects needed
  
  // Статические файлы для PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
