# 🚀 Установка Vinetka Pro CRM на VPS

## Требования
- Ubuntu 25.10 (или 22.04+)
- Root или sudo доступ
- Минимум 1GB RAM
- 10GB свободного места на диске

---

## 📋 Быстрая установка

### Шаг 1: Подключитесь к VPS
```bash
ssh root@YOUR_SERVER_IP
```

### Шаг 2: Скачайте и запустите скрипт установки
```bash
# Скачать репозиторий
cd /tmp
git clone https://github.com/zaasglg/vinetka-crm.git
cd vinetka-crm/deploy

# Сделать скрипт исполняемым
chmod +x install.sh

# Запустить установку
./install.sh
```

⏱️ **Установка занимает 5-10 минут**

---

## 🔧 Что устанавливает скрипт

1. **Системные пакеты**: curl, wget, git, unzip
2. **PHP 8.3** + расширения (sqlite3, gd, curl, mbstring, xml, и т.д.)
3. **Composer** (менеджер пакетов PHP)
4. **Nginx** (веб-сервер)
5. **Node.js 20** + npm
6. **PM2** (менеджер процессов для WhatsApp сервиса)
7. **SQLite** (база данных)
8. Laravel приложение в `/var/www/vinetkaprocrm`
9. Зависимости PHP и Node.js
10. База данных с тестовыми данными
11. WhatsApp сервис (автозапуск через PM2)

---

## 📝 После установки

### 1. Настройте .env файл
```bash
cd /var/www/vinetkaprocrm
sudo nano .env
```

**Обязательно измените:**
```env
APP_URL=http://your-domain.com  # Ваш домен или IP
OPENAI_API_KEY=sk-proj-...      # Ваш OpenAI API ключ для AI автоответчика
```

**Сохраните** (Ctrl+O, Enter, Ctrl+X)

### 2. Примените изменения
```bash
cd /var/www/vinetkaprocrm
php artisan config:clear
php artisan cache:clear
```

### 3. Настройте Firewall (UFW)
```bash
# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH (если еще не разрешен)

# Включить firewall
sudo ufw enable
```

---

## 🔐 Доступ к системе

После установки откройте в браузере:
```
http://YOUR_SERVER_IP
```

**Данные для входа:**
- Email: `admin@vinetka.pro`
- Пароль: `admin123`

⚠️ **ВАЖНО**: Сразу после входа смените пароль!

---

## 📱 WhatsApp интеграция

WhatsApp сервис автоматически запущен через PM2:

```bash
# Проверить статус
pm2 status

# Посмотреть логи
pm2 logs whatsapp-service

# Перезапустить
pm2 restart whatsapp-service
```

Для подключения WhatsApp:
1. Войдите в админку CRM
2. Перейдите в раздел "WhatsApp"
3. Нажмите "Переподключить"
4. Отсканируйте QR-код в приложении WhatsApp

---

## 🔒 Настройка SSL (HTTPS)

### Вариант 1: Let's Encrypt (бесплатно)
```bash
# Установить certbot
sudo apt install -y certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d your-domain.com

# Автопродление (уже настроено)
sudo certbot renew --dry-run
```

### Вариант 2: Cloudflare
1. Добавьте домен в Cloudflare
2. Настройте DNS записи (A record → IP сервера)
3. Включите SSL/TLS в Cloudflare (Full)

---

## 🛠️ Полезные команды

### Laravel
```bash
cd /var/www/vinetkaprocrm

# Посмотреть логи
tail -f storage/logs/laravel.log

# Очистить кеш
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Запустить миграции
php artisan migrate

# Пересобрать фронтенд
npm run build
```

### Nginx
```bash
# Перезапустить
sudo systemctl restart nginx

# Проверить конфигурацию
sudo nginx -t

# Посмотреть логи
sudo tail -f /var/log/nginx/error.log
```

### PM2 (WhatsApp)
```bash
# Статус всех процессов
pm2 status

# Логи
pm2 logs whatsapp-service

# Перезапуск
pm2 restart whatsapp-service

# Остановить
pm2 stop whatsapp-service

# Запустить
pm2 start whatsapp-service
```

### Система
```bash
# Проверить использование ресурсов
htop

# Проверить место на диске
df -h

# Проверить память
free -h

# Перезагрузить сервер
sudo reboot
```

---

## 🐛 Решение проблем

### Проблема: Ошибка 502 Bad Gateway

**Решение:**
```bash
# Проверить статус PHP-FPM
sudo systemctl status php8.3-fpm

# Перезапустить PHP-FPM
sudo systemctl restart php8.3-fpm

# Перезапустить Nginx
sudo systemctl restart nginx
```

### Проблема: Белый экран / ошибка 500

**Решение:**
```bash
cd /var/www/vinetkaprocrm

# Посмотреть логи
tail -f storage/logs/laravel.log

# Исправить права
sudo chown -R www-data:www-data /var/www/vinetkaprocrm
sudo chmod -R 775 storage bootstrap/cache

# Очистить кеш
php artisan cache:clear
php artisan config:clear
```

### Проблема: WhatsApp не подключается

**Решение:**
```bash
# Проверить статус сервиса
pm2 status

# Посмотреть логи
pm2 logs whatsapp-service

# Перезапустить
pm2 restart whatsapp-service

# Проверить что порт 3001 не занят
sudo netstat -tulpn | grep 3001
```

### Проблема: База данных не найдена

**Решение:**
```bash
cd /var/www/vinetkaprocrm

# Создать БД заново
touch database/database.sqlite
php artisan migrate --force
php artisan db:seed --force
```

---

## 📊 Мониторинг

### Установка мониторинга (опционально)
```bash
# Установить htop для мониторинга ресурсов
sudo apt install -y htop

# Запустить
htop
```

### Настройка логирования
```bash
# Laravel логи
tail -f /var/www/vinetkaprocrm/storage/logs/laravel.log

# Nginx логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2 логи
pm2 logs
```

---

## 🔄 Обновление приложения

```bash
cd /var/www/vinetkaprocrm

# Скачать обновления
git pull origin main

# Установить зависимости
composer install --no-dev --optimize-autoloader
npm install

# Применить миграции
php artisan migrate --force

# Пересобрать фронтенд
npm run build

# Очистить кеш
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Оптимизировать
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Перезапустить сервисы
sudo systemctl restart nginx
pm2 restart all
```

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи (см. раздел "Полезные команды")
2. Убедитесь что все сервисы запущены
3. Проверьте права на файлы и папки

---

## 📚 Дополнительно

### Настройка резервного копирования
```bash
# Создать скрипт бэкапа
sudo nano /usr/local/bin/backup-vinetka.sh
```

Содержимое скрипта:
```bash
#!/bin/bash
BACKUP_DIR="/backups/vinetka"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Бэкап базы данных
cp /var/www/vinetkaprocrm/database/database.sqlite "$BACKUP_DIR/db_$DATE.sqlite"

# Бэкап файлов
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" /var/www/vinetkaprocrm/storage/app

# Удалить старые бэкапы (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Сделать исполняемым и добавить в cron:
```bash
sudo chmod +x /usr/local/bin/backup-vinetka.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-vinetka.sh") | crontab -
```

---

✅ **Готово!** Ваша CRM система установлена и готова к работе.
