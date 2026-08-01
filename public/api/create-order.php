<?php
/**
 * Приём заказа: запись в orders + order_items, уведомление в Telegram.
 * Заменяет прямые вызовы Supabase + Edge Function (тип 'order').
 * Ответ: { success: true, order: { id } }
 */
require __DIR__ . '/db.php';

$cfg = load_config();
send_cors($cfg);
require_post();

$in = read_json_body();

// --- Валидация ---
$name = trim((string) (isset($in['customer_name']) ? $in['customer_name'] : ''));
if ($name === '') {
    json_out(['error' => 'customer_name required'], 400);
}
$items = isset($in['items']) ? $in['items'] : [];
if (!is_array($items) || count($items) === 0) {
    json_out(['error' => 'items required'], 400);
}

$pdo = db_connect($cfg);

$orderId = uuidv4();
$tgItems = [];

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'INSERT INTO orders
         (id, status, customer_name, customer_contact, contact_method, comment,
          total_amount, delivery_cost, discount_amount, age_confirmed,
          delivery_method, delivery_address, distance_from_mkad, professional_launch_requested)
         VALUES (?, \'created\', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $orderId,
        $name,
        isset($in['customer_contact']) ? $in['customer_contact'] : null,
        isset($in['contact_method']) ? $in['contact_method'] : null,
        isset($in['comment']) ? $in['comment'] : null,
        (int) (isset($in['total_amount']) ? $in['total_amount'] : 0),
        (int) (isset($in['delivery_cost']) ? $in['delivery_cost'] : 0),
        (int) (isset($in['discount_amount']) ? $in['discount_amount'] : 0),
        !empty($in['age_confirmed']) ? 1 : 0,
        isset($in['delivery_method']) ? $in['delivery_method'] : 'pickup',
        isset($in['delivery_address']) ? $in['delivery_address'] : null,
        (isset($in['distance_from_mkad']) && $in['distance_from_mkad'] !== null)
            ? (int) $in['distance_from_mkad'] : null,
        !empty($in['professional_launch_requested']) ? 1 : 0,
    ]);

    $itemStmt = $pdo->prepare(
        'INSERT INTO order_items (id, order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)'
    );
    $nameStmt = $pdo->prepare('SELECT name FROM products WHERE id = ?');

    foreach ($items as $it) {
        $pid = isset($it['product_id']) ? $it['product_id'] : null;
        $qty = (int) (isset($it['quantity']) ? $it['quantity'] : 1);
        $price = (int) (isset($it['price_at_time']) ? $it['price_at_time'] : 0);

        $itemStmt->execute([uuidv4(), $orderId, $pid, $qty, $price]);

        $pname = 'Товар';
        if ($pid) {
            $nameStmt->execute([$pid]);
            $row = $nameStmt->fetch();
            if ($row && isset($row['name'])) {
                $pname = $row['name'];
            }
        }
        $tgItems[] = ['name' => $pname, 'quantity' => $qty, 'price' => $price];
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_out(['error' => 'Failed to create order'], 500);
}

// Telegram — не влияет на успех заказа
try {
    send_telegram($cfg, build_order_message($in, $orderId, $tgItems));
} catch (Throwable $e) {
    // молча игнорируем
}

json_out(['success' => true, 'order' => ['id' => $orderId]]);


function build_order_message($o, $orderId, $items)
{
    $shortId = substr($orderId, 0, 8);

    $contact = '';
    if (!empty($o['contact_method']) && !empty($o['customer_contact'])) {
        $m = $o['contact_method'] === 'telegram' ? 'Telegram'
            : ($o['contact_method'] === 'whatsapp' ? 'WhatsApp' : 'Телефон');
        $contact = "\n📱 " . $m . ': ' . h($o['customer_contact']);
    }

    $comment = !empty($o['comment']) ? "\n💬 Комментарий: " . h($o['comment']) : '';

    $prof = !empty($o['professional_launch_requested'])
        ? "\n🎆 Запуск салютов: <b>Да</b> \n⚠️ Обсудить детали и стоимость запуска салютов"
        : '';

    if ((isset($o['delivery_method']) ? $o['delivery_method'] : '') === 'pickup') {
        $delivery = "\n🏬 <b>Самовывоз</b> (бесплатно)\n📍 улица Агрогородок, вл31, деревня Чёрное, городской округ Балашиха, Московская область";
    } else {
        $addr = !empty($o['delivery_address'])
            ? "\n📍 " . h($o['delivery_address'])
            : "\n📍 <i>Адрес не указан. Необходимо уточнить</i>";
        $delivery = "\n🚚 <b>Доставка</b> - " . rub(isset($o['delivery_cost']) ? $o['delivery_cost'] : 0) . ' ₽' . $addr;
    }

    $dist = !empty($o['distance_from_mkad']) ? "\n🚗 Расстояние от МКАД: " . h($o['distance_from_mkad']) . ' км' : '';

    $discountInfo = '';
    $subtotal = (int) (isset($o['total_amount']) ? $o['total_amount'] : 0)
        - (int) (isset($o['discount_amount']) ? $o['discount_amount'] : 0);
    if ($subtotal >= 60000) {
        $discountInfo = "\n🎁 <b>Бонусы:</b> 10% скидка + подарок включены";
    } elseif ($subtotal >= 40000) {
        $discountInfo = "\n🎁 <b>Бонусы:</b> 5% скидка + подарок включены";
    } elseif ($subtotal >= 10000) {
        $discountInfo = "\n🎁 <b>Бонусы:</b> подарок включен";
    }

    $lines = [];
    foreach ($items as $it) {
        $lines[] = '• ' . h($it['name']) . ' - ' . $it['quantity'] . ' шт. × ' . rub($it['price']) . ' ₽';
    }
    $itemsText = implode("\n", $lines);

    $time = (new DateTime('now', new DateTimeZone('Europe/Moscow')))->format('d.m.Y, H:i:s');

    $msg = "🎆 <b>Новый заказ!</b>\n\n"
        . '🆔 Заказ: #' . $shortId . "\n"
        . '👤 Клиент: ' . h($o['customer_name']) . $contact . "\n\n"
        . "🛒 <b>Товары:</b>\n" . $itemsText . "\n"
        . $delivery . $dist . $discountInfo . $comment . $prof . "\n\n"
        . '💰 <b>Итого: ' . rub(isset($o['total_amount']) ? $o['total_amount'] : 0) . " ₽</b>\n\n"
        . '⏰ Время: ' . $time;

    return trim($msg);
}
