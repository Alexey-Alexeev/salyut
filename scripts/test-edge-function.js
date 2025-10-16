/**
 * Тестовый скрипт для проверки Supabase Edge Function
 */

const SUPABASE_URL = 'https://gqnwyyinswqoustiqtpk.supabase.co';
// ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ ANON KEY ИЗ SUPABASE DASHBOARD
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

async function testEdgeFunction() {
    console.log('🧪 Тестирование Supabase Edge Function...\n');

    try {
        // Тест консультации
        console.log('📞 Тестирование уведомления о консультации...');
        
        const consultationResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-telegram-notification`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'consultation',
                data: {
                    consultation: {
                        id: 'test-consultation-123',
                        name: 'Тест Тестович',
                        contact_method: 'phone',
                        contact_info: '+7-999-123-45-67',
                        message: 'Тестовое сообщение для проверки Edge Function'
                    }
                }
            })
        });

        const consultationResult = await consultationResponse.json();
        
        if (consultationResponse.ok) {
            console.log('✅ Консультация: Успешно отправлено!');
            console.log('📋 Ответ:', consultationResult);
        } else {
            console.log('❌ Консультация: Ошибка');
            console.log('📋 Ошибка:', consultationResult);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Тест заказа
        console.log('🛒 Тестирование уведомления о заказе...');
        
        const orderResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-telegram-notification`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'order',
                data: {
                    order: {
                        id: 'test-order-456',
                        customer_name: 'Иван Иванов',
                        contact_method: 'telegram',
                        customer_contact: '@ivan_ivanov',
                        comment: 'Тестовый заказ',
                        delivery_method: 'delivery',
                        delivery_address: 'Москва, ул. Тестовая, д. 1',
                        delivery_cost: 500,
                        total_amount: 2500,
                        discount_amount: 0,
                        professional_launch_requested: false,
                        distance_from_mkad: 5
                    },
                    items: [
                        {
                            name: 'Тестовый фейерверк',
                            quantity: 2,
                            price: 1000
                        }
                    ]
                }
            })
        });

        const orderResult = await orderResponse.json();
        
        if (orderResponse.ok) {
            console.log('✅ Заказ: Успешно отправлено!');
            console.log('📋 Ответ:', orderResult);
        } else {
            console.log('❌ Заказ: Ошибка');
            console.log('📋 Ошибка:', orderResult);
        }

    } catch (error) {
        console.error('❌ Ошибка при тестировании:', error);
    }

    console.log('\n🎯 Тестирование завершено!');
}

// Запуск теста
testEdgeFunction();
