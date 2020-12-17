FROM amazeeio/php:7.3-cli-drupal
COPY composer.json composer.lock /app/
COPY patches /app/patches
RUN composer install --prefer-dist --no-dev --no-suggest --optimize-autoloader --apcu-autoloader
COPY . /app

# Define where the Drupal Root is located
ENV WEBROOT=web
ENV SB_ENVIRONMENT=amazeeio
