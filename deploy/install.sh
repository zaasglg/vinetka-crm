#!/bin/bash

# ========================================
# Vinetka Pro CRM - Installation Script
# Ubuntu 25.10 / PHP 8.3 / Node.js 20
# ========================================

set -e  # Exit on error

echo "========================================="
echo "Vinetka Pro CRM Installation"
echo "========================================="
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install basic tools
echo "🛠️ Installing basic tools..."
sudo apt install -y curl wget git unzip software-properties-common

# Install PHP 8.3 and extensions
echo "🐘 Installing PHP 8.3..."
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt install -y php8.3 php8.3-cli php8.3-fpm php8.3-common \
    php8.3-mysql php8.3-zip php8.3-gd php8.3-mbstring php8.3-curl \
    php8.3-xml php8.3-bcmath php8.3-sqlite3 php8.3-intl php8.3-redis

# Install Composer
echo "📦 Installing Composer..."
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Node.js 20
echo "📗 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for Node.js process management
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Install SQLite
echo "💾 Installing SQLite..."
sudo apt install -y sqlite3

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/vinetkaprocrm
sudo chown -R $USER:$USER /var/www/vinetkaprocrm

# Clone repository
echo "📥 Cloning repository..."
cd /var/www
if [ -d "vinetkaprocrm/.git" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd vinetkaprocrm
    git pull
else
    sudo rm -rf vinetkaprocrm
    git clone https://github.com/zaasglg/vinetka-crm.git vinetkaprocrm
    cd vinetkaprocrm
fi

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Copy environment file
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env file created from .env.example"
else
    echo "⚠️ .env file already exists, skipping..."
fi

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate --force

# Create database
echo "💾 Setting up database..."
touch database/database.sqlite
php artisan migrate --force

# Run seeders
echo "🌱 Running database seeders..."
php artisan db:seed --force

# Build frontend assets
echo "🎨 Building frontend assets..."
npm run build

# Set permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data /var/www/vinetkaprocrm
sudo chmod -R 755 /var/www/vinetkaprocrm
sudo chmod -R 775 /var/www/vinetkaprocrm/storage
sudo chmod -R 775 /var/www/vinetkaprocrm/bootstrap/cache

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/vinetkaprocrm > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/vinetkaprocrm/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/vinetkaprocrm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
echo "🔄 Restarting Nginx..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup PM2 for WhatsApp service
echo "📱 Setting up WhatsApp service with PM2..."
cd /var/www/vinetkaprocrm/services/whatsapp
npm install

# Create PM2 ecosystem file
cat > ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: 'whatsapp-service',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      WHATSAPP_SERVICE_PORT: 3001,
      LARAVEL_URL: 'http://127.0.0.1'
    }
  }]
};
EOF

# Start WhatsApp service with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Optimize Laravel
echo "⚡ Optimizing Laravel..."
cd /var/www/vinetkaprocrm
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Setup cron for Laravel scheduler (if needed)
echo "⏰ Setting up Laravel scheduler..."
(crontab -l 2>/dev/null; echo "* * * * * cd /var/www/vinetkaprocrm && php artisan schedule:run >> /dev/null 2>&1") | crontab -

echo ""
echo "========================================="
echo "✅ Installation Complete!"
echo "========================================="
echo ""
echo "📊 Application: http://$(curl -s ifconfig.me)"
echo "📱 WhatsApp Service: http://$(curl -s ifconfig.me):3001"
echo ""
echo "🔐 Default Login:"
echo "   Email: admin@vinetka.pro"
echo "   Password: admin123"
echo ""
echo "⚙️ Important Next Steps:"
echo "1. Edit /var/www/vinetkaprocrm/.env:"
echo "   - Set APP_URL to your domain"
echo "   - Add OPENAI_API_KEY for AI auto-reply"
echo "2. Run: cd /var/www/vinetkaprocrm && php artisan config:clear"
echo "3. Setup firewall: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
echo "4. Setup SSL with Let's Encrypt (see SSL_SETUP.md)"
echo ""
echo "📝 Useful Commands:"
echo "   - View logs: tail -f /var/www/vinetkaprocrm/storage/logs/laravel.log"
echo "   - PM2 status: pm2 status"
echo "   - PM2 logs: pm2 logs whatsapp-service"
echo "   - Restart app: sudo systemctl restart nginx && pm2 restart all"
echo ""
