# WhatsApp Service (Baileys)

Сервис для интеграции WhatsApp в CRM систему.

## Установка

```bash
cd services/whatsapp
npm install
```

## Запуск

### Режим разработки
```bash
npm run dev
```

### Продакшн
```bash
npm start
```

### С pm2 (рекомендуется для продакшна)
```bash
npm install -g pm2
pm2 start server.js --name whatsapp-service
pm2 save
pm2 startup
```

## Первое подключение

1. Запустите сервис: `npm start`
2. Откройте в браузере: `http://localhost:3001/status`
3. Отсканируйте QR-код из терминала или полученный в JSON
4. После подключения статус изменится на `connected`

## API Endpoints

### GET /status
Получить статус подключения и QR-код (если есть)

**Ответ:**
```json
{
  "status": "connected",
  "qr": null,
  "connected": true
}
```

### POST /send-message
Отправить текстовое сообщение

**Body:**
```json
{
  "phone": "79161234567",
  "message": "Привет! Ваша заявка готова."
}
```

### POST /send-media
Отправить изображение или документ

**Body:**
```json
{
  "phone": "79161234567",
  "url": "https://example.com/image.jpg",
  "caption": "Ваш выпускной альбом",
  "type": "image"
}
```

### POST /disconnect
Отключиться от WhatsApp (выход из аккаунта)

### POST /reconnect
Переподключиться (пересоздать сессию)

## Использование из Laravel

```php
use Illuminate\Support\Facades\Http;

// Отправка сообщения
Http::post('http://localhost:3001/send-message', [
    'phone' => '79161234567',
    'message' => 'Ваша заявка #' . $order->id . ' готова!'
]);

// Проверка статуса
$response = Http::get('http://localhost:3001/status');
$status = $response->json();
```

## Переменные окружения

В `.env` можно добавить:
```
WHATSAPP_SERVICE_PORT=3001
```

## Безопасность

- Папка `auth_state/` содержит данные сессии - НЕ добавляйте её в git
- Рекомендуется использовать firewall для ограничения доступа к порту 3001
- В продакшне используйте nginx reverse proxy с HTTPS
