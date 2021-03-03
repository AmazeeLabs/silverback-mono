FROM amazeeio/node:14-builder as builder

# See the explanation of the following lines in gatsby-preview.dockerfile.
RUN apk add --no-cache autoconf automake libtool nasm
COPY lerna.json package.json yarn.lock /app/
COPY apps /app/apps
COPY packages /app/packages
RUN set -x && \
sed -i 's|"dependencies":|"workspaces": { "nohoist": ["**"] }, "dependencies":|g' apps/silverback-gatsby/package.json && \
(CYPRESS_INSTALL_BINARY=0 yarn || true) && \
(CYPRESS_INSTALL_BINARY=0 yarn) && \
cd /app/apps/silverback-gatsby/node_modules && \
for f in $(find . -maxdepth 1 -type l); do l=$(readlink -f $f) && rm $f && cp -rf $l $f; done && \
cd - && \
mv /app/apps/silverback-gatsby /tmp/silverback-gatsby && \
rm -rf /app

FROM amazeeio/node:14
COPY --from=builder /tmp/silverback-gatsby /app

# App env vars.
ENV ENABLE_GATSBY_REFRESH_ENDPOINT=true
ENV DRUPAL_BASE_URL=https://nginx-silverback-gatsby-development.ch.amazee.io
ENV DRUPAL_GRAHPQL_ENDPOINT=https://nginx-silverback-gatsby-development.ch.amazee.io/silverback-gatsby
ENV GATSBY_PLUGIN_BUILD_MONITOR_ENDPOINT=https://nginx-silverback-gatsby-development.ch.amazee.io/gatsby-build-monitor/set-state
ENV GATSBY_PLUGIN_BUILD_MONITOR_TOKEN=zbryaiSF9xjfNrVEu9RSqxt5QqfeQp6FJB5TKTQg950
ENV DRUPAL_PREVIEW_USER_CREDENTIALS=GatsbyPreview:GatsbyPreview

CMD ["yarn", "fast-builds:serve:netlify"]
