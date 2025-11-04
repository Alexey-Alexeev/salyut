/**
 * Города Москвы и Московской области для локальных SEO-страниц
 * Включает правильные склонения для использования в заголовках
 */

export interface City {
    slug: string; // URL-friendly название для роутинга
    name: string; // Название города в именительном падеже
    nameLocative: string; // Название в предложном падеже (в чём? где?)
    nameAccusative: string; // Название в винительном падеже (в куда?)
    region: string; // Регион
    metaDescription: string; // Уникальное мета-описание
    population?: number; // Население (опционально, для приоритизации)
}

export const cities: City[] = [
    {
        slug: 'moskva',
        name: 'Москва',
        nameLocative: 'Москве и Московской области',
        nameAccusative: 'Москву',
        region: 'Москва',
        metaDescription: 'Купить фейерверки и салюты в Москве с доставкой. Безопасный запуск пиротехники на свадьбу, день рождения. Качественные салюты от проверенных производителей!',
        population: 13000000,
    },
    {
        slug: 'balashiha',
        name: 'Балашиха',
        nameLocative: 'Балашихе',
        nameAccusative: 'Балашиху',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Балашихе с доставкой. Безопасный запуск пиротехники на праздник. Быстрая доставка по Балашихе и области!',
        population: 520000,
    },
    {
        slug: 'podolsk',
        name: 'Подольск',
        nameLocative: 'Подольске',
        nameAccusative: 'Подольск',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Подольске с доставкой. Безопасный запуск салюта на свадьбу и другие праздники! Качественная пиротехника!',
        population: 300000,
    },
    {
        slug: 'himki',
        name: 'Химки',
        nameLocative: 'Химках',
        nameAccusative: 'Химки',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Химках с доставкой. Безопасный запуск пиротехники. Быстрая доставка по Химкам!',
        population: 260000,
    },
    {
        slug: 'lyubertsy',
        name: 'Люберцы',
        nameLocative: 'Люберцах',
        nameAccusative: 'Люберцы',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Люберцах с доставкой. Безопасный запуск пиротехники на любые праздники!',
        population: 210000,
    },
    {
        slug: 'krasnogorsk',
        name: 'Красногорск',
        nameLocative: 'Красногорске',
        nameAccusative: 'Красногорск',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Красногорске с доставкой. Качественная пиротехника от проверенных производителей!',
        population: 180000,
    },
    {
        slug: 'mytishchi',
        name: 'Мытищи',
        nameLocative: 'Мытищах',
        nameAccusative: 'Мытищи',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Мытищах с доставкой. Безопасный запуск салюта на праздники!',
        population: 250000,
    },
    {
        slug: 'korolev',
        name: 'Королёв',
        nameLocative: 'Королёве',
        nameAccusative: 'Королёв',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Королёве с доставкой. Качественная пиротехника для ваших праздников!',
        population: 225000,
    },
    {
        slug: 'odincovo',
        name: 'Одинцово',
        nameLocative: 'Одинцово',
        nameAccusative: 'Одинцово',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Одинцово с доставкой. Безопасный запуск пиротехники!',
        population: 150000,
    },
    {
        slug: 'pushkino',
        name: 'Пушкино',
        nameLocative: 'Пушкино',
        nameAccusative: 'Пушкино',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Пушкино с доставкой. Качественная пиротехника от проверенных производителей!',
        population: 110000,
    },
    {
        slug: 'shchelkovo',
        name: 'Щёлково',
        nameLocative: 'Щёлково',
        nameAccusative: 'Щёлково',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Щёлково с доставкой. Безопасный запуск салюта на праздники!',
        population: 125000,
    },
    {
        slug: 'domodedovo',
        name: 'Домодедово',
        nameLocative: 'Домодедово',
        nameAccusative: 'Домодедово',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Домодедово с доставкой. Качественная пиротехника для праздников!',
        population: 130000,
    },
    {
        slug: 'dolgoprudny',
        name: 'Долгопрудный',
        nameLocative: 'Долгопрудном',
        nameAccusative: 'Долгопрудный',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Долгопрудном с доставкой. Безопасный запуск пиротехники на праздники! Качественная пиротехника!',
        population: 120000,
    },
    {
        slug: 'orekhovo-zuevo',
        name: 'Орехово-Зуево',
        nameLocative: 'Орехово-Зуево',
        nameAccusative: 'Орехово-Зуево',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Орехово-Зуево с доставкой. Качественная пиротехника!',
        population: 120000,
    },
    {
        slug: 'reutov',
        name: 'Реутов',
        nameLocative: 'Реутове',
        nameAccusative: 'Реутов',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Реутове с доставкой. Безопасный запуск салюта!',
        population: 110000,
    },
    {
        slug: 'zheleznodorozhny',
        name: 'Железнодорожный',
        nameLocative: 'Железнодорожном',
        nameAccusative: 'Железнодорожный',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Железнодорожном с доставкой. Качественная пиротехника!',
        population: 155000,
    },
    {
        slug: 'elektrostal',
        name: 'Электросталь',
        nameLocative: 'Электростали',
        nameAccusative: 'Электросталь',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Электростали с доставкой. Качественная пиротехника для праздников!',
        population: 160000,
    },
    {
        slug: 'zhukovskiy',
        name: 'Жуковский',
        nameLocative: 'Жуковском',
        nameAccusative: 'Жуковский',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Жуковском с доставкой. Безопасный запуск салюта!',
        population: 110000,
    },
    {
        slug: 'noginsk',
        name: 'Ногинск',
        nameLocative: 'Ногинске',
        nameAccusative: 'Ногинск',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Ногинске с доставкой. Качественная пиротехника!',
        population: 100000,
    },
    {
        slug: 'vidnoe',
        name: 'Видное',
        nameLocative: 'Видном',
        nameAccusative: 'Видное',
        region: 'Московская область',
        metaDescription: 'Купить фейерверки и салюты в Видном с доставкой. Безопасный запуск пиротехники!',
        population: 70000,
    },
];

/**
 * Получить данные города по slug
 */
export function getCityBySlug(slug: string): City | undefined {
    return cities.find(city => city.slug === slug);
}

/**
 * Получить все slugs для генерации статических страниц
 */
export function getAllCitySlugs(): string[] {
    return cities.map(city => city.slug);
}

/**
 * Проверить, существует ли город
 */
export function isCitySlugValid(slug: string): boolean {
    return cities.some(city => city.slug === slug);
}


