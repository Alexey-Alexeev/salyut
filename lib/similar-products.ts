/**
 * Функция для поиска похожих товаров на основе поискового запроса
 */

import { Product } from '@/types/catalog';

/**
 * Вычисляет схожесть строк (улучшенная версия)
 * Возвращает число от 0 до 1, где 1 - полное совпадение
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Полное совпадение
    if (s1 === s2) return 1;

    // Одна строка содержит другую
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;

    // Нормализуем строки: убираем знаки препинания и лишние пробелы
    const normalize = (str: string) => str.replace(/[^\w\sа-яё]/gi, '').replace(/\s+/g, ' ').trim();
    const n1 = normalize(s1);
    const n2 = normalize(s2);
    
    // Проверяем после нормализации
    if (n1 === n2) return 0.95;
    if (n1.includes(n2) || n2.includes(n1)) return 0.85;

    // Проверяем похожие слова (с учетом склонений и вариаций)
    const words1 = n1.split(/\s+/).filter(w => w.length > 1);
    const words2 = n2.split(/\s+/).filter(w => w.length > 1);
    
    // Ищем общие слова или похожие
    let commonCount = 0;
    for (const word1 of words1) {
        for (const word2 of words2) {
            // Полное совпадение слова
            if (word1 === word2) {
                commonCount++;
                break;
            }
            // Проверяем похожие слова (для "яблок" -> "яблочко")
            if (word1.length >= 3 && word2.length >= 3) {
                // Проверяем общий корень (первые 3-5 символов)
                const minLen = Math.min(word1.length, word2.length);
                const rootLen = Math.min(5, Math.max(3, minLen - 1));
                const root1 = word1.substring(0, rootLen);
                const root2 = word2.substring(0, rootLen);
                
                if (root1 === root2) {
                    // Высокий балл за общий корень, особенно если разница в длине небольшая
                    const lengthDiff = Math.abs(word1.length - word2.length);
                    if (lengthDiff <= 3) {
                        commonCount += 0.95;
                    } else if (lengthDiff <= 5) {
                        commonCount += 0.7;
                    } else {
                        commonCount += 0.5;
                    }
                    break;
                }
                
                // Проверяем вхождение корня одного слова в другое
                if (rootLen >= 3) {
                    if (word1.includes(root2) || word2.includes(root1)) {
                        commonCount += 0.8;
                        break;
                    }
                }
            }
            // Проверяем общие подстроки длиной 3+ символов
            if (word1.length >= 3 && word2.length >= 3) {
                for (let len = Math.min(word1.length, word2.length); len >= 3; len--) {
                    let found = false;
                    for (let i = 0; i <= word1.length - len; i++) {
                        const substr = word1.substring(i, i + len);
                        if (word2.includes(substr)) {
                            commonCount += Math.min(0.6, len / Math.max(word1.length, word2.length));
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
            }
        }
    }

    if (commonCount === 0) {
        // Проверяем общие подстроки в целом тексте
        let maxCommonLength = 0;
        for (let len = Math.min(n1.length, n2.length); len >= 3; len--) {
            for (let i = 0; i <= n1.length - len; i++) {
                const substr = n1.substring(i, i + len);
                if (n2.includes(substr)) {
                    maxCommonLength = Math.max(maxCommonLength, len);
                }
            }
        }
        
        if (maxCommonLength >= 4) {
            return Math.min(0.5, (maxCommonLength / Math.max(n1.length, n2.length)) * 0.8);
        }
        return 0;
    }

    // Нормализуем результат на основе количества совпадений
    const maxWords = Math.max(words1.length, words2.length);
    const similarity = Math.min(1, (commonCount / maxWords) * 0.9);
    
    // Бонус за общие подстроки
    let maxCommonLength = 0;
    for (let len = Math.min(n1.length, n2.length); len >= 3; len--) {
        for (let i = 0; i <= n1.length - len; i++) {
            const substr = n1.substring(i, i + len);
            if (n2.includes(substr)) {
                maxCommonLength = Math.max(maxCommonLength, len);
                break;
            }
        }
    }
    
    const lengthBonus = maxCommonLength > 0 
        ? (maxCommonLength / Math.max(n1.length, n2.length)) * 0.1 
        : 0;
    
    return Math.min(1, similarity + lengthBonus);
}

/**
 * Находит похожие товары на основе поискового запроса
 * @param searchQuery - поисковый запрос пользователя
 * @param allProducts - все доступные товары
 * @param limit - максимальное количество товаров для возврата (по умолчанию 3)
 */
export function findSimilarProducts(
    searchQuery: string,
    allProducts: Product[],
    limit: number = 3
): Product[] {
    if (!searchQuery || !searchQuery.trim()) {
        return [];
    }

    const query = searchQuery.trim().toLowerCase();

    // Вычисляем схожесть для каждого товара
    const productsWithSimilarity = allProducts.map(product => ({
        product,
        similarity: calculateSimilarity(query, product.name)
    }));

    // Сортируем по схожести (убывание) и фильтруем товары со схожестью > 0.03
    const similarProducts = productsWithSimilarity
        .filter(({ similarity }) => similarity > 0.03)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(({ product }) => product);

    return similarProducts;
}

