FROM amazeeio/node:14-builder as builder

# For mozjpeg to compile required stuff.
RUN apk add --no-cache autoconf automake libtool nasm

# The monorepo dance 💃
# Install dependencies for the whole monorepo because
# 1. The --ignore-workspaces flag is not implemented https://github.com/yarnpkg/yarn/issues/4099
# 2. The --focus flag is broken https://github.com/yarnpkg/yarn/issues/6715
COPY lerna.json package.json yarn.lock /app/
COPY apps /app/apps
COPY packages /app/packages
RUN set -e && \
# Avoid the target workspace dependencies to land in the root node_modules.
sed -i 's|"dependencies":|"workspaces": { "nohoist": ["**"] }, "dependencies":|g' apps/silverback-gatsby/package.json && \
# Run `yarn install` twice to workaround https://github.com/yarnpkg/yarn/issues/6988
(CYPRESS_INSTALL_BINARY=0 yarn || true) && \
# No idea how it's possible, but with `(CYPRESS_INSTALL_BINARY=0 yarn || yarn)`
# the second `yarn install` sometimes can't see the CYPRESS_INSTALL_BINARY env
# var.
(CYPRESS_INSTALL_BINARY=0 yarn) && \
# Find all linked node_modules and dereference them so that there are no broken
# symlinks in the next container. (Don't use `cp -rL` because then it also
# dereferences node_modules/.bin/* and thus breaks them.)
cd /app/apps/silverback-gatsby/node_modules && \
for f in $(find . -maxdepth 1 -type l); do l=$(readlink -f $f) && rm $f && cp -rf $l $f; done && \
cd - && \
# Remove everything except the target workspace to reduce the layer size.
mv /app/apps/silverback-gatsby /tmp/silverback-gatsby && \
rm -rf /app

# Wake up the Drupal container in case if it sleeps.
RUN wget https://nginx-silverback-gatsby-development.ch.amazee.io

FROM amazeeio/node:14
COPY --from=builder /tmp/silverback-gatsby /app

# App env vars.
ENV ENABLE_GATSBY_REFRESH_ENDPOINT=true
ENV DRUPAL_GRAHPQL_ENDPOINT=https://nginx-silverback-gatsby-development.ch.amazee.io/graphql
ENV GATSBY_PLUGIN_BUILD_MONITOR_ENDPOINT=https://nginx-silverback-gatsby-development.ch.amazee.io/gatsby-build-monitor/set-state
ENV GATSBY_PLUGIN_BUILD_MONITOR_TOKEN=zbryaiSF9xjfNrVEu9RSqxt5QqfeQp6FJB5TKTQg950
ENV DRUPAL_PREVIEW_USER_CREDENTIALS=GatsbyPreview:GatsbyPreview

CMD ["yarn", "develop", "--host", "0.0.0.0", "--port", "3000"]
