<?php
/**
 * Read-only выгрузка каталога для сборки статического сайта.
 * Сборка (npm run build) тянет этот JSON вместо прямого доступа к БД.
 * Отдаёт: categories, manufacturers, products (все), reviews.
 * Данные публичные (это витрина), секретов не содержит.
 *
 * URL: https://salutgrad.ru/api/catalog.php
 */
require __DIR__ . '/db.php';

$cfg = load_config();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');
send_cors($cfg);

$pdo = db_connect($cfg);

$categories = $pdo->query('SELECT * FROM categories ORDER BY name')->fetchAll();
$manufacturers = $pdo->query('SELECT * FROM manufacturers ORDER BY name')->fetchAll();
$products = $pdo->query('SELECT * FROM products')->fetchAll();
$reviews = $pdo->query('SELECT * FROM reviews ORDER BY sort_order ASC, created_at DESC')->fetchAll();

// JSON-колонки в MySQL приходят строками — декодируем в массивы/объекты.
// Булевы и числовые поля приводим к нормальным типам (в MySQL это 0/1 и строки).
foreach ($products as &$p) {
    $p['images'] = isset($p['images']) && $p['images'] !== null ? json_decode($p['images'], true) : [];
    $p['characteristics'] = isset($p['characteristics']) && $p['characteristics'] !== null ? json_decode($p['characteristics'], true) : null;
    $p['event_types'] = isset($p['event_types']) && $p['event_types'] !== null ? json_decode($p['event_types'], true) : [];
    $p['price'] = (int) $p['price'];
    $p['old_price'] = isset($p['old_price']) && $p['old_price'] !== null ? (int) $p['old_price'] : null;
    $p['is_popular'] = (bool) $p['is_popular'];
    $p['is_active'] = (bool) $p['is_active'];
}
unset($p);

foreach ($reviews as &$r) {
    $r['is_approved'] = (bool) $r['is_approved'];
    $r['sort_order'] = (int) $r['sort_order'];
}
unset($r);

foreach ($categories as &$c) {
    // ничего декодировать не нужно, но оставим точку расширения
}
unset($c);

echo json_encode([
    'categories' => $categories,
    'manufacturers' => $manufacturers,
    'products' => $products,
    'reviews' => $reviews,
], JSON_UNESCAPED_UNICODE);
