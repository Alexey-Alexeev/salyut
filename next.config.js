/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Статический экспорт для хостинга
  output: 'export',
  trailingSlash: true,
  // Исключаем папку supabase из сборки Next.js
  webpack: (config) => {
    config.module.rules.push({
      test: /supabase\/.*\.ts$/,
      use: 'ignore-loader',
    });
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
  },
  // Принудительное обновление кеша
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Redirects are handled at DNS/hosting level
  // No application-level redirects needed
};

module.exports = nextConfig;
