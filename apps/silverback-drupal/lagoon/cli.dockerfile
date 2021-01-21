FROM amazeeio/php:7.4-cli-drupal

COPY apps/silverback-drupal/composer.json apps/silverback-drupal/composer.lock /app/
COPY apps/silverback-drupal/patches /app/patches

# Copy local packages.
COPY packages/composer/amazeelabs/silverback-cli /app/packages/composer/amazeelabs/silverback-cli
COPY packages/composer/drupal/gatsby_build_monitor /app/packages/composer/drupal/gatsby_build_monitor
COPY packages/composer/drupal/cypress /app/packages/composer/drupal/cypress
COPY packages/composer/drupal/cypress-dev /app/packages/composer/drupal/cypress-dev
# And fix paths to them in composer files.
RUN sed -i 's|"\.\./\.\.|"/app|g' composer.json composer.lock

RUN composer install --prefer-dist --no-dev --no-suggest --optimize-autoloader --apcu-autoloader

COPY apps/silverback-drupal/ /app

# Define where the Drupal Root is located
ENV WEBROOT=web
ENV SB_ENVIRONMENT=amazeeio
