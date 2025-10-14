/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
  // Поддержка двух доменов
  async redirects() {
    return [
      // Редирект с www на основной домен
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.салютград.рф',
          },
        ],
        destination: 'https://салютград.рф/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.salutgrad.ru',
          },
        ],
        destination: 'https://salutgrad.ru/:path*',
        permanent: true,
      },
    ];
  },
  // Принудительное обновление кеша
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
};

module.exports = nextConfig;
