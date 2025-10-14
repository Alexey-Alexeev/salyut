// Поддержка двух доменов
export const domains = {
    primary: 'салютград.рф',
    secondary: 'salutgrad.ru'
} as const;

// Функция для получения базового URL в зависимости от окружения
export function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        // Клиентская сторона
        return window.location.origin;
    }

    if (process.env.VERCEL_URL) {
        // Vercel deployment
        return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.NODE_ENV === 'development') {
        // Локальная разработка
        return 'http://localhost:3000';
    }

    // Production - используем основной домен
    return `https://${domains.primary}`;
}

// Функция для генерации канонических URL
export function getCanonicalUrl(path: string = ''): string {
    const baseUrl = getBaseUrl();
    return `${baseUrl}${path}`;
}

// Функция для проверки, является ли домен основным
export function isPrimaryDomain(hostname: string): boolean {
    return hostname === domains.primary || hostname === `www.${domains.primary}`;
}



