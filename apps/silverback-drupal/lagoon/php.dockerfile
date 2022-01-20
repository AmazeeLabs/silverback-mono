ARG CLI_IMAGE
FROM ${CLI_IMAGE} as builder

FROM uselagoon/php-8.1-fpm

COPY --from=builder /app /app
ENV SB_ENVIRONMENT=amazeeio
