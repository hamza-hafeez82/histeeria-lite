# Use the official PHP image with Apache
FROM php:8.2-apache

# Enable Apache mod_rewrite for routing if needed
RUN a2enmod rewrite

# Install required system dependencies and PHP extensions (like PostgreSQL for Supabase if doing server-side DB ops)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Set working directory
WORKDIR /var/www/html

# Copy the application code into the container
COPY . /var/www/html/

# Change Apache's DocumentRoot to the public/ directory
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Expose port 80
EXPOSE 80

# Start Apache in the foreground
CMD ["apache2-foreground"]
