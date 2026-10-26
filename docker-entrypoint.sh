#!/bin/bash
set -e

# Jika Render menyediakan variabel PORT dinamis, sesuaikan port Apache
if [ -n "$PORT" ]; then
    sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
    sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:$PORT>/" /etc/apache2/sites-available/000-default.conf
fi

# Pastikan permission folder writable tetap valid
chown -R www-data:www-data /var/www/html/writable
chmod -R 775 /var/www/html/writable

exec "$@"

