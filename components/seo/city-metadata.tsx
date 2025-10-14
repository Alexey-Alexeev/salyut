import { Metadata } from 'next';
import { moscowRegionCities, generateCitySEO, getCityInPrepositionalCase, isMoscowRegionCity, normalizeCityName } from '@/lib/cities';

interface CityMetadataProps {
    city?: string;
    defaultTitle?: string;
    defaultDescription?: string;
}

export function generateCityMetadata({
    city,
    defaultTitle = 'Фейерверки и салюты в Москве и МО | СалютГрад',
    defaultDescription = 'Купить фейерверки в Москве и МО с доставкой. Профессиональный запуск салютов на свадьбу и день рождения. Лучшие салюты и пиротехника!'
}: CityMetadataProps): Metadata {
    // Если город не указан или не входит в список городов МО, используем дефолтные мета-теги
    if (!city || !moscowRegionCities.includes(city)) {
        return {
            title: defaultTitle,
            description: defaultDescription,
            keywords: 'фейерверки москва, салюты купить, пиротехника, петарды, ракеты, фонтаны, новый год, день рождения, свадьба, профессиональный запуск салютов, доставка москва',
        };
    }

    const citySEO = generateCitySEO(city);
    const cityInPrepositionalCase = getCityInPrepositionalCase(city);

    return {
        title: citySEO.title,
        description: citySEO.description,
        keywords: citySEO.keywords,
        openGraph: {
            ...citySEO.openGraph,
            siteName: 'СалютГрад',
            locale: 'ru_RU',
            type: 'website',
            images: [
                {
                    url: 'https://салютград.рф/images/hero-bg.webp',
                    width: 1200,
                    height: 630,
                    alt: `Фейерверки и салюты в ${cityInPrepositionalCase} - СалютГрад`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: citySEO.title,
            description: citySEO.description,
            images: ['https://салютград.рф/images/hero-bg.webp'],
        },
        alternates: {
            canonical: `https://салютград.рф?city=${encodeURIComponent(city)}`,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

// Хук для получения города из URL параметров
export function getCityFromSearchParams(searchParams: { [key: string]: string | string[] | undefined }): string | undefined {
    const city = searchParams.city;
    if (typeof city === 'string' && isMoscowRegionCity(city)) {
        // Возвращаем нормализованное название города
        return normalizeCityName(city);
    }
    return undefined;
}
