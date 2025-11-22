#!/bin/bash

# ========================================
# Vinetka Pro CRM - Installation Script
# Ubuntu 25.10 + SSL для vinetkapro.my
# ========================================

set -e  # Exit on error

DOMAIN="vinetkapro.my"
DOMAIN_WWW="www.vinetkapro.my"

echo "========================================="
echo "Vinetka Pro CRM Installation"
echo "Domain: $DOMAIN"
echo "========================================="
echo ""

# Удалить проблемные репозитории
echo "🧹 Cleaning up problematic repositories..."
sudo rm -f /etc/apt/sources.list.d/monarx.list 2>/dev/null || true
sudo rm -f /etc/apt/sources.list.d/ondrej-ubuntu-php-questing.list 2>/dev/null || true

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install basic tools
echo "🛠️ Installing basic tools..."
sudo apt install -y curl wget git unzip software-properties-common

# Install PHP 8.3 from default Ubuntu repositories
echo "🐘 Installing PHP 8.3 from system repositories..."
sudo apt install -y php php-fpm php-cli php-common \
    php-sqlite3 php-curl php-gd php-mbstring \
    php-xml php-zip php-bcmath php-intl \
    php-readline php-opcache

# Get actual PHP version
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "✅ Installed PHP version: $PHP_VERSION"

# Install Composer
echo "📦 Installing Composer..."
if [ ! -f /usr/local/bin/composer ]; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
else
    echo "✅ Composer already installed"
fi

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install certbot for SSL
echo "🔒 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Install Node.js 20
echo "📗 Installing Node.js 20..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✅ Node.js installed: $(node --version)"
    echo "✅ npm installed: $(npm --version)"
else
    echo "✅ Node.js already installed: $(node --version)"
    echo "✅ npm already installed: $(npm --version)"
fi

# Install PM2 for Node.js process management
echo "⚙️ Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "✅ PM2 installed: $(pm2 --version)"
else
    echo "✅ PM2 already installed: $(pm2 --version)"
fi

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
    echo "✅ .env file created"
    
    # Update .env with domain
    sed -i "s|APP_URL=http://localhost|APP_URL=https://$DOMAIN|g" .env
else
    echo "⚠️ .env file already exists"
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
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/vinetkaprocrm
sudo chmod -R 775 /var/www/vinetkaprocrm/storage
sudo chmod -R 775 /var/www/vinetkaprocrm/bootstrap/cache

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/vinetkaprocrm > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_WWW;
    root /var/www/vinetkaprocrm/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php\$ {
        fastcgi_pass unix:/var/run/php/php$PHP_VERSION-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/vinetkaprocrm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "✅ Testing Nginx configuration..."
sudo nginx -t

# Restart services
echo "🔄 Restarting services..."
sudo systemctl enable php$PHP_VERSION-fpm
sudo systemctl restart php$PHP_VERSION-fpm
sudo systemctl enable nginx
sudo systemctl restart nginx

# Setup WhatsApp Service
echo "📱 Setting up WhatsApp service..."
cd /var/www/vinetkaprocrm/services/whatsapp

# Install WhatsApp service dependencies
npm install

# Configure PM2
pm2 delete whatsapp-service 2>/dev/null || true
pm2 start server.js --name whatsapp-service
pm2 save
pm2 startup | tail -n 1 | bash

# Optimize Laravel
echo "⚡ Optimizing Laravel..."
cd /var/www/vinetkaprocrm
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Setup SSL with Certbot
echo ""
echo "🔒 Setting up SSL certificate..."
echo "⚠️  Make sure your domain $DOMAIN points to this server IP: $(hostname -I | awk '{print $1}')"
echo ""
read -p "Press Enter to continue with SSL setup or Ctrl+C to skip..."

sudo certbot --nginx -d $DOMAIN -d $DOMAIN_WWW --non-interactive --agree-tos --email admin@$DOMAIN --redirect || {
    echo "⚠️  SSL setup failed or was skipped. You can run it manually later:"
    echo "   sudo certbot --nginx -d $DOMAIN -d $DOMAIN_WWW"
}

# Setup SSL auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo ""
echo "==========================================="
echo "✅ Installation Complete!"
echo "==========================================="
echo ""
echo "📍 Your CRM is available at:"
echo "   https://$DOMAIN"
echo "   https://$DOMAIN_WWW"
echo "   http://$(hostname -I | awk '{print $1}')"
echo ""
echo "🔐 Default login credentials:"
echo "   Email: admin@vinetka.pro"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change the default password after first login!"
echo ""
echo "📱 WhatsApp service status:"
pm2 status
echo ""
echo "🔒 SSL Certificate:"
echo "   Auto-renewal: Enabled"
echo "   To check: sudo certbot certificates"
echo ""
echo "📚 Useful commands:"
echo "   View logs: pm2 logs whatsapp-service"
echo "   Restart: pm2 restart whatsapp-service"
echo "   Laravel logs: tail -f /var/www/vinetkaprocrm/storage/logs/laravel.log"
echo ""
echo "🎉 Happy using Vinetka Pro CRM!"
echo ""
