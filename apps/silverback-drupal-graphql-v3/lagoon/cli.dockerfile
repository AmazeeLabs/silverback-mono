FROM amazeeio/php:7.3-cli-drupal
COPY composer.json composer.lock /app/
COPY patches /app/patches

# Require published versions of locally developed packages.
RUN cat <<< $(jq 'del(.repositories[0])' composer.json) > composer.json
RUN composer require drupal/gatsby_build_monitor

RUN composer install --prefer-dist --no-dev --no-suggest --optimize-autoloader --apcu-autoloader
COPY . /app

# Define where the Drupal Root is located
ENV WEBROOT=web
ENV SB_ENVIRONMENT=amazeeio
