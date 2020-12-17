FROM amazeeio/php:7.3-cli-drupal

COPY apps/silverback-drupal-graphql-v3/composer.json apps/silverback-drupal-graphql-v3/composer.lock /app/
COPY apps/silverback-drupal-graphql-v3/patches /app/patches

# Copy local packages.
COPY packages/composer/amazeelabs/silverback-cli /app/packages/composer/amazeelabs/silverback-cli
COPY packages/composer/drupal/gatsby_build_monitor /app/packages/composer/drupal/gatsby_build_monitor
# And fix paths to them in composer files.
RUN sed -i 's|"\.\./\.\.|"/app|g' composer.json composer.lock

RUN composer install --prefer-dist --no-dev --no-suggest --optimize-autoloader --apcu-autoloader

COPY apps/silverback-drupal-graphql-v3/ /app

# Define where the Drupal Root is located
ENV WEBROOT=web

ENV SB_ENVIRONMENT=amazeeio
