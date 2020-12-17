FROM amazeeio/php:7.3-cli-drupal
COPY packages /app/packages
COPY apps/silverback-drupal-graphql-v3/composer.json apps/silverback-drupal-graphql-v3/composer.lock /app/
COPY apps/silverback-drupal-graphql-v3/patches /app/patches

RUN composer selfupdate --2

# Fix path to local composer packages
RUN sed -i 's|"\.\./\.\.|"/app|g' composer.json composer.lock

RUN composer install --prefer-dist --no-dev --no-suggest --optimize-autoloader --apcu-autoloader
COPY apps/silverback-drupal-graphql-v3/ /app

# Define where the Drupal Root is located
ENV WEBROOT=web
ENV SB_ENVIRONMENT=amazeeio
