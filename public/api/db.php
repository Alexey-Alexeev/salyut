<?php
/**
 * Общие помощники для PHP-обработчиков: конфиг, подключение к БД,
 * CORS, JSON-ответы, генерация UUID и отправка в Telegram.
 * Совместимо с PHP 7.x и 8.x (без стрелочных функций и т.п.).
 */

function load_config()
{
    $path = __DIR__ . '/config.php';
    if (!file_exists($path)) {
        json_out(['error' => 'config.php not found on server'], 500);
    }
    return require $path;
}

function send_cors($cfg)
{
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $allowed = isset($cfg['allowed_origins']) ? $cfg['allowed_origins'] : [];
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Vary: Origin');
}

function json_out($data, $code = 200)
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body()
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function db_connect($cfg)
{
    $dsn = 'mysql:host=' . $cfg['db_host'] . ';dbname=' . $cfg['db_name'] . ';charset=utf8mb4';
    try {
        return new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        json_out(['error' => 'DB connection failed'], 500);
    }
}

function uuidv4()
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function rub($n)
{
    return number_format((int) $n, 0, '.', ' ');
}

/** Экранирование для Telegram parse_mode=HTML (только < > & ). */
function h($s)
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Требует метод POST, обрабатывает preflight OPTIONS. */
function require_post()
{
    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : '';
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if ($method !== 'POST') {
        json_out(['error' => 'Method not allowed'], 405);
    }
}

function send_telegram($cfg, $text)
{
    $token = isset($cfg['telegram_bot_token']) ? $cfg['telegram_bot_token'] : '';
    $chat = isset($cfg['telegram_chat_id']) ? $cfg['telegram_chat_id'] : '';
    if (!$token || !$chat) {
        return;
    }
    $url = 'https://api.telegram.org/bot' . $token . '/sendMessage';
    $payload = http_build_query([
        'chat_id' => $chat,
        'text' => $text,
        'parse_mode' => 'HTML',
    ]);
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        curl_exec($ch);
        curl_close($ch);
    }
}
