FROM php:8.2-apache

# Install dependencies sistem & ekstensi PHP yang dibutuhkan CodeIgniter 4 dan PostgreSQL/SQLite
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install \
    intl \
    pdo \
    pdo_pgsql \
    pgsql \
    pdo_mysql \
    mysqli \
    zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Atur DocumentRoot Apache ke folder public milik CodeIgniter 4
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Aktifkan konfigurasi AllowOverride All untuk .htaccess
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf || true

WORKDIR /var/www/html

# Copy semua file aplikasi ke container
COPY . /var/www/html

# Install dependensi PHP via Composer
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Berikan hak akses writable folder
RUN chown -R www-data:www-data /var/www/html/writable \
    && chmod -R 775 /var/www/html/writable

# Salin script entrypoint untuk menangani port dinamis Render ($PORT)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]

