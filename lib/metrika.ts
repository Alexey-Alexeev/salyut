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

/**
 * Отправляет событие в Яндекс.Метрику
 * @param goalName - название цели
 * @param params - дополнительные параметры события
 */
export function sendMetrikaGoal(goalName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  const ym = (window as any).ym;
  if (!ym) {
    console.warn('Yandex Metrika not loaded');
    return;
  }

  try {
    ym(METRIKA_ID, 'reachGoal', goalName, params);
    console.log(`Metrika goal sent: ${goalName}`, params);
  } catch (error) {
    console.error('Error sending Metrika goal:', error);
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

