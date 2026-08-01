<?php
/**
 * Приём заявки на консультацию: запись в consultations + Telegram.
 * Заменяет прямой вызов Supabase + Edge Function (тип 'consultation').
 * Ответ: { success: true, consultation: { id } }
 */
require __DIR__ . '/db.php';

$cfg = load_config();
send_cors($cfg);
require_post();

$in = read_json_body();

$name = trim((string) (isset($in['name']) ? $in['name'] : ''));
$method = trim((string) (isset($in['contactMethod']) ? $in['contactMethod'] : ''));
$info = trim((string) (isset($in['contactInfo']) ? $in['contactInfo'] : ''));
$message = isset($in['message']) && $in['message'] !== '' ? $in['message'] : null;

if ($name === '' || $method === '' || $info === '') {
    json_out(['error' => 'name, contactMethod, contactInfo required'], 400);
}

$pdo = db_connect($cfg);
$id = uuidv4();

try {
    $stmt = $pdo->prepare(
        'INSERT INTO consultations (id, name, contact_method, contact_info, message, status)
         VALUES (?, ?, ?, ?, ?, \'new\')'
    );
    $stmt->execute([$id, $name, $method, $info, $message]);
} catch (Throwable $e) {
    json_out(['error' => 'Failed to create consultation'], 500);
}

try {
    send_telegram($cfg, build_consultation_message($name, $method, $info, $message, $id));
} catch (Throwable $e) {
    // молча игнорируем
}

json_out(['success' => true, 'consultation' => ['id' => $id]]);


function build_consultation_message($name, $method, $info, $message, $id)
{
    $shortId = substr($id, 0, 8);

    $map = [
        'phone' => '📞 Телефон',
        'telegram' => '📱 Telegram',
        'whatsapp' => '📱 WhatsApp',
    ];
    $methodText = isset($map[$method]) ? $map[$method] : '📞 Контакт';

    $messageText = $message ? "\n\n💬 Комментарий: " . h($message) : '';

    $time = (new DateTime('now', new DateTimeZone('Europe/Moscow')))->format('d.m.Y, H:i:s');

    $msg = "🎆 <b>Новая заявка на консультацию!</b>\n\n"
        . '🆔 ID: #' . $shortId . "\n"
        . '👤 Имя: ' . h($name) . "\n"
        . $methodText . ': ' . h($info) . $messageText . "\n\n"
        . '⏰ Время: ' . $time;

    return trim($msg);
}
