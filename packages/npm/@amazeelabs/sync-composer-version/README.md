# Sync Composer version

Syncs `version` field value from `package.json` to `composer.json`.

We need to keep versions in sync because Renovate updates version ranges and
Composer throws errors like this one:

```
Root composer.json requires amazeelabs/proxy-drupal-core ^1.1, it is satisfiable by amazeelabs/proxy-drupal-core[1.1.0, 1.1.1] from composer repo (https://repo.packagist.org) but amazeelabs/proxy-drupal-core[1.0.0] from path repo (../../packages/composer/*/*) has higher repository priority. The packages from the higher priority repository do not match your constraint and are therefore not installable. That repository is canonical so the lower priority repo's packages are not installable. See https://getcomposer.org/repoprio for details and assistance.
```
