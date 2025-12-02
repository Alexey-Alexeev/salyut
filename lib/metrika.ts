/**
 * Утилиты для работы с Яндекс.Метрикой
 * 
 * ВЕБВИЗОР: Для отображения значений полей ввода в вебвизоре:
 * 1. Перейдите в Яндекс.Метрику → Настройки → Вебвизор
 * 2. Отключите опцию "Записывать все поля"
 * 3. Все поля с классом "ym-record-keys" будут записываться в вебвизор
 * 4. Значения будут видны в вебвизоре при просмотре записей сеансов
 * 
 * Поля с записью:
 * - Имя (форма заказа и консультации)
 * - Контакт (телефон/telegram/whatsapp)
 * - Адрес доставки
 * - Комментарий
 * - Поиск товара в каталоге
 * - Фильтр по цене (От и До)
 * - Фильтр по категориям (чекбоксы)
 */

// ID счетчика Яндекс.Метрики
const METRIKA_ID = 104700931;

// Типизация для Яндекс Метрики
declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: string,
      ...args: any[]
    ) => void;
  }
}

/**
 * Отправляет событие просмотра страницы в Яндекс.Метрику
 * Используется для SPA-сайтов с defer:true
 * @param url - URL страницы (относительный или абсолютный)
 * @param options - дополнительные параметры
 */
export function sendMetrikaHit(url?: string, options?: {
  title?: string;
  referer?: string;
  params?: Record<string, any>;
}) {
  if (typeof window === 'undefined') return;
  
  const ym = window.ym;
  if (!ym) {
    console.warn('[Metrika] Counter not loaded');
    return;
  }

  try {
    const targetUrl = url || window.location.href;
    ym(METRIKA_ID, 'hit', targetUrl, options);
    console.log('[Metrika] Manual hit sent:', targetUrl);
  } catch (error) {
    console.error('[Metrika] Error sending hit:', error);
  }
}

/**
 * Отправляет событие достижения цели в Яндекс.Метрику
 * @param goalName - название цели
 * @param params - дополнительные параметры события
 */
export function sendMetrikaGoal(goalName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  const ym = window.ym;
  if (!ym) {
    console.warn('[Metrika] Counter not loaded');
    return;
  }

  try {
    ym(METRIKA_ID, 'reachGoal', goalName, params);
    console.log('[Metrika] Goal reached:', goalName, params);
  } catch (error) {
    console.error('[Metrika] Error sending goal:', error);
  }
}

/**
 * Отправляет событие о успешном заказе
 * @param orderData - данные заказа
 */
export function trackOrderSuccess(orderData: {
  orderValue?: number;
  deliveryMethod?: string;
  customerName?: string;
  orderId?: string;
}) {
  sendMetrikaGoal('order_success', {
    order_value: orderData.orderValue || 0,
    delivery_method: orderData.deliveryMethod || 'unknown',
    customer_name: orderData.customerName || 'unknown',
    order_id: orderData.orderId || 'unknown'
  });
}

/**
 * Отправляет событие о успешной консультации
 * @param consultationData - данные консультации
 */
export function trackConsultationSuccess(consultationData: {
  customerName?: string;
  contactMethod?: string;
}) {
  sendMetrikaGoal('consultation_success', {
    customer_name: consultationData.customerName || 'unknown',
    contact_method: consultationData.contactMethod || 'unknown'
  });
}

