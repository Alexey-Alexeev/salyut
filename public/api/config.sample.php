<?php
/**
 * ШАБЛОН конфига. На сервере скопируй этот файл в config.php и впиши реальные значения.
 *
 * ВАЖНО:
 *  - config.php НЕ коммитится в git (см. .gitignore) и НЕ перезаписывается деплоем.
 *  - Заливается на сервер ОДИН раз вручную через файловый менеджер.
 */
return [
    // --- База данных MySQL (reg.ru) ---
    'db_host' => 'localhost',
    'db_name' => 'u3296733_salytgrad',
    'db_user' => 'ВПИШИ_ПОЛЬЗОВАТЕЛЯ_БД',
    'db_pass' => 'ВПИШИ_ПАРОЛЬ_БД',

    // --- Telegram (значения возьми из своего .env.local) ---
    'telegram_bot_token' => 'ВПИШИ_TELEGRAM_BOT_TOKEN',
    'telegram_chat_id'   => 'ВПИШИ_TELEGRAM_CHAT_ID',

    // --- С каких доменов разрешены запросы (CORS) ---
    'allowed_origins' => [
        'https://salutgrad.ru',
        'https://www.salutgrad.ru',
    ],
];
