/**
 * IndexNow API для уведомления Яндекса об изменениях на сайте
 * Документация: https://yandex.com/support/webmaster/indexnow.html
 */

const INDEXNOW_KEY = '5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk';
const INDEXNOW_URL = 'https://yandex.com/indexnow';

export interface IndexNowResponse {
  success: boolean;
  status: number;
  message: string;
}

/**
 * Отправляет один URL в Яндекс через IndexNow
 * @param url - URL страницы для индексации
 * @param host - хост сайта (опционально, по умолчанию берется из URL)
 */
export async function submitSingleUrl(url: string, host?: string): Promise<IndexNowResponse> {
  try {
    const urlObj = new URL(url);
    const siteHost = host || urlObj.host;
    
    const params = new URLSearchParams({
      url: url,
      key: INDEXNOW_KEY,
      host: siteHost
    });

    const response = await fetch(`${INDEXNOW_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      success: response.status === 202,
      status: response.status,
      message: response.status === 202 
        ? 'URL успешно отправлен в Яндекс' 
        : `Ошибка: ${response.status} ${response.statusText}`
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: `Ошибка при отправке: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
    };
  }
}

/**
 * Отправляет несколько URL в Яндекс через IndexNow
 * @param urls - массив URL для индексации
 * @param host - хост сайта (опционально)
 */
export async function submitMultipleUrls(urls: string[], host?: string): Promise<IndexNowResponse> {
  try {
    if (urls.length === 0) {
      return {
        success: false,
        status: 0,
        message: 'Список URL пуст'
      };
    }

    // Если один URL, используем GET метод
    if (urls.length === 1) {
      return await submitSingleUrl(urls[0], host);
    }

    // Для нескольких URL используем POST метод
    const urlObj = new URL(urls[0]);
    const siteHost = host || urlObj.host;

    const response = await fetch(INDEXNOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: siteHost,
        key: INDEXNOW_KEY,
        urlList: urls
      }),
    });

    return {
      success: response.status === 202,
      status: response.status,
      message: response.status === 202 
        ? `${urls.length} URL успешно отправлены в Яндекс` 
        : `Ошибка: ${response.status} ${response.statusText}`
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: `Ошибка при отправке: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
    };
  }
}

/**
 * Отправляет URL страницы продукта в Яндекс
 * @param productSlug - slug продукта
 * @param baseUrl - базовый URL сайта (по умолчанию salutgrad.ru)
 */
export async function submitProductUrl(productSlug: string, baseUrl: string = 'https://salutgrad.ru'): Promise<IndexNowResponse> {
  const productUrl = `${baseUrl}/product/${productSlug}`;
  return await submitSingleUrl(productUrl);
}

/**
 * Отправляет URL страницы категории в Яндекс
 * @param categorySlug - slug категории
 * @param baseUrl - базовый URL сайта (по умолчанию salutgrad.ru)
 */
export async function submitCategoryUrl(categorySlug: string, baseUrl: string = 'https://salutgrad.ru'): Promise<IndexNowResponse> {
  const categoryUrl = `${baseUrl}/category/${categorySlug}`;
  return await submitSingleUrl(categoryUrl);
}

/**
 * Отправляет основные страницы сайта в Яндекс
 * @param baseUrl - базовый URL сайта (по умолчанию salutgrad.ru)
 */
export async function submitMainPages(baseUrl: string = 'https://salutgrad.ru'): Promise<IndexNowResponse> {
  const mainPages = [
    `${baseUrl}/`,
    `${baseUrl}/catalog`,
    `${baseUrl}/about`,
    `${baseUrl}/delivery`,
    `${baseUrl}/privacy`,
    `${baseUrl}/terms`
  ];

  return await submitMultipleUrls(mainPages);
}

/**
 * Получает ключ IndexNow
 */
export function getIndexNowKey(): string {
  return INDEXNOW_KEY;
}

