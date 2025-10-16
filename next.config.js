/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Статический экспорт для хостинга
  output: 'export',
  trailingSlash: true,
  // Исключаем папку edge-functions из сборки Next.js
  webpack: (config) => {
    config.module.rules.push({
      test: /edge-functions\/.*\.ts$/,
      use: 'ignore-loader',
    });
    // Также исключаем все файлы с Deno импортами
    config.module.rules.push({
      test: /.*\.ts$/,
      include: /edge-functions/,
      use: 'ignore-loader',
    });
    
    // Оптимизация бандла
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
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
  // Принудительное обновление кеша
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Redirects are handled at DNS/hosting level
  // No application-level redirects needed
};

module.exports = nextConfig;
