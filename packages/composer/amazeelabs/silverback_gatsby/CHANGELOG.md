# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.16.3](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.16.2...@-amazeelabs/silverback_gatsby@1.16.3) (2022-04-27)

**Note:** Version bump only for package @-amazeelabs/silverback_gatsby





## [1.16.2](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.16.1...@-amazeelabs/silverback_gatsby@1.16.2) (2022-03-08)

**Note:** Version bump only for package @-amazeelabs/silverback_gatsby





## [1.16.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.16.0...@-amazeelabs/silverback_gatsby@1.16.1) (2022-03-07)


### Bug Fixes

* remove basic_auth from dependencies ([122381b](https://github.com/AmazeeLabs/silverback-mono/commit/122381b86aad8e7c761915997a2c1a3a768c7b19))





# [1.16.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.15.0...@-amazeelabs/silverback_gatsby@1.16.0) (2022-01-26)


### Features

* link servers to users, not roles ([cda4436](https://github.com/AmazeeLabs/silverback-mono/commit/cda443623af848f7262fed835554e8d9c7d108b6))





# [1.15.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.14.2...@-amazeelabs/silverback_gatsby@1.15.0) (2022-01-25)


### Features

* introduce new directives and rename existing ones ([c9255ca](https://github.com/AmazeeLabs/silverback-mono/commit/c9255ca6c3bdd8ad954be00013c6f2f0faae4eaf))





## [1.14.2](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.14.1...@-amazeelabs/silverback_gatsby@1.14.2) (2022-01-19)


### Bug Fixes

* keep not translatable menu links ([b2fa801](https://github.com/AmazeeLabs/silverback-mono/commit/b2fa8014f4191bcf251d0e1b2cd28ecab4eaae58))
* rely on the negotiated language instead of the default one ([d6388e8](https://github.com/AmazeeLabs/silverback-mono/commit/d6388e883af056402e895ca954cdcb7320f39682))





## [1.14.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.14.0...@-amazeelabs/silverback_gatsby@1.14.1) (2022-01-19)


### Bug Fixes

* fix regex ([5c964db](https://github.com/AmazeeLabs/silverback-mono/commit/5c964dbcfcb0d0ed6a23e63cbe5826fc4f99eb96))
* restore tests in multiple packages ([92c2e00](https://github.com/AmazeeLabs/silverback-mono/commit/92c2e003e162d991e5cc7fee511e75c7339f0049))
* support projects with content_translation module disabled ([a8bf062](https://github.com/AmazeeLabs/silverback-mono/commit/a8bf0625d19bde6f18d6491cad3d67e5b39ead5e))





# [1.14.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.13.3...@-amazeelabs/silverback_gatsby@1.14.0) (2022-01-05)


### Features

* allow loading entities by UUID ([6da1055](https://github.com/AmazeeLabs/silverback-mono/commit/6da10551ab53fb4e93c3fbd29a58e1d6d9456a7c))





## [1.13.3](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.13.2...@-amazeelabs/silverback_gatsby@1.13.3) (2022-01-03)


### Bug Fixes

* fix schema export ([eb81e00](https://github.com/AmazeeLabs/silverback-mono/commit/eb81e00266d4f6648babc84cef3aa09184d7b5e3))





## [1.13.2](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.13.1...@-amazeelabs/silverback_gatsby@1.13.2) (2021-12-27)

**Note:** Version bump only for package @-amazeelabs/silverback_gatsby





## [1.13.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.13.0...@-amazeelabs/silverback_gatsby@1.13.1) (2021-12-23)

**Note:** Version bump only for package @-amazeelabs/silverback_gatsby





# [1.13.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.12.0...@-amazeelabs/silverback_gatsby@1.13.0) (2021-12-10)


### Bug Fixes

* **gatsby:** fall back to first published translation if the source is not accessible in listings ([db8897c](https://github.com/AmazeeLabs/silverback-mono/commit/db8897cf28744c8c22f36e08318780c940e54988)), closes [#882](https://github.com/AmazeeLabs/silverback-mono/issues/882)


### Features

* **gatsby:** make limit and offset in list queries optional ([70cd820](https://github.com/AmazeeLabs/silverback-mono/commit/70cd8209e60da0cbc6167a78510b84d3d9b4ca31)), closes [#849](https://github.com/AmazeeLabs/silverback-mono/issues/849)





# [1.12.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.11.4...@-amazeelabs/silverback_gatsby@1.12.0) (2021-12-03)


### Bug Fixes

* **gatsby:** inconsistent usage of build_hook and build_webhook ([fd47201](https://github.com/AmazeeLabs/silverback-mono/commit/fd47201898fdfc32510a4d2db369e66e525dfb4c))
* **gatsby:** reset access control handler cache between investigating old and updated entities ([7c37490](https://github.com/AmazeeLabs/silverback-mono/commit/7c37490eb20b7bce7d0c642da50667f250c83c86))
* **gatsby:** set all current test nodes to "unpublished" ([63779a9](https://github.com/AmazeeLabs/silverback-mono/commit/63779a977e98e2c100a433df175dfb99d6bb30c9))


### Features

* **gatsby:** configuration forms for gatsby build webhooks and roles ([6201ddc](https://github.com/AmazeeLabs/silverback-mono/commit/6201ddcf2db4edc112a9c7d35595d5768eb92582))
* **gatsby:** inspect original entites on update to detect transitions over permission borders ([13a7d94](https://github.com/AmazeeLabs/silverback-mono/commit/13a7d9489dd03ee7dbed29e3d11f91a49b5ec882))
* **gatsby:** only send updates to server if they are relevant for the selected role ([9290820](https://github.com/AmazeeLabs/silverback-mono/commit/92908204e711a7713debbf149905a5e067f5e69f))
* **gatsby:** pass artificial account into feed update investigation ([eb7294b](https://github.com/AmazeeLabs/silverback-mono/commit/eb7294bd59e9f35a6004110904f2a89124e81677))
* **gatsby:** use update webhooks from graphql schema configuration ([d9760b1](https://github.com/AmazeeLabs/silverback-mono/commit/d9760b173c3525f9347a5b2d75e71d120353590e))





## [1.11.4](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.11.3...@-amazeelabs/silverback_gatsby@1.11.4) (2021-10-11)


### Bug Fixes

* unpublished translation bug ([f4a9ca4](https://github.com/AmazeeLabs/silverback-mono/commit/f4a9ca489ac495cae38cb4763165182cad8616df))





## [1.11.3](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.11.2...@-amazeelabs/silverback_gatsby@1.11.3) (2021-10-11)

**Note:** Version bump only for package @-amazeelabs/silverback_gatsby





## [1.11.2](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.11.1...@-amazeelabs/silverback_gatsby@1.11.2) (2021-09-15)

**Note:** Version bump only for package @-amazeelabs/silverback_gatsby





## [1.11.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.11.0...@-amazeelabs/silverback_gatsby@1.11.1) (2021-09-06)


### Bug Fixes

* adjust bundle type so that it meets [@entity](https://github.com/entity) directive definition ([6dd8a2b](https://github.com/AmazeeLabs/silverback-mono/commit/6dd8a2bbb516248dfb6d59a6631540da29132a8c))





# [1.11.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.10.0...@-amazeelabs/silverback_gatsby@1.11.0) (2021-08-09)


### Bug Fixes

* **gatsby:** properly update gatsby on menu item deletion ([0d954f1](https://github.com/AmazeeLabs/silverback-mono/commit/0d954f13fb75bf7a2a1ae6c67f6e0af85017087d))


### Features

* **gatsby:** add [@property](https://github.com/property) directive for GraphQL ([f5df6b9](https://github.com/AmazeeLabs/silverback-mono/commit/f5df6b90f7bec9a8d5df8edd13433e0175d43632))





# [1.10.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.9.1...@-amazeelabs/silverback_gatsby@1.10.0) (2021-07-29)


### Features

* **gatsby:** create gatsby pages automatically ([2155aa7](https://github.com/AmazeeLabs/silverback-mono/commit/2155aa71b6b2a058030440e3ee71badf634fc9a8))





## [1.9.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.9.0...@-amazeelabs/silverback_gatsby@1.9.1) (2021-07-08)


### Bug Fixes

* **gatsby:** return null for missing translations ([0ec1cee](https://github.com/AmazeeLabs/silverback-mono/commit/0ec1cee738ee26dcbeba549879b6d5be33f92ccd))





# [1.9.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.8.2...@-amazeelabs/silverback_gatsby@1.9.0) (2021-07-01)


### Features

* **gatsby:** nullify inaccessible entities instead of failing ([cf171d5](https://github.com/AmazeeLabs/silverback-mono/commit/cf171d5bb351cecdff6fd28a895ec8c9b3a227a0))





## [1.8.2](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.8.1...@-amazeelabs/silverback_gatsby@1.8.2) (2021-06-30)


### Bug Fixes

* **gatsby:** return translation list for untranslated entities ([668673b](https://github.com/AmazeeLabs/silverback-mono/commit/668673bcc16301ae69b6fec8c44c710d5d31c8cf))





## [1.8.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.8.0...@-amazeelabs/silverback_gatsby@1.8.1) (2021-06-30)


### Bug Fixes

* **gatsby:** sort feed plugins by id so directive definitions are ordered in export ([47495e4](https://github.com/AmazeeLabs/silverback-mono/commit/47495e444aa5e7527b5802b28ab20e0e22507fbd))





# [1.8.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.7.0...@-amazeelabs/silverback_gatsby@1.8.0) (2021-06-28)


### Features

* **gatsby:** accept access flag in entity list producer ([2d36f46](https://github.com/AmazeeLabs/silverback-mono/commit/2d36f467f2494d8fd3e801418046d845cd4cc3fa))





# [1.7.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.6.1...@-amazeelabs/silverback_gatsby@1.7.0) (2021-06-28)


### Features

* **gatsby:** allow to bypass access checks with entity directive ([3f5d23d](https://github.com/AmazeeLabs/silverback-mono/commit/3f5d23d11ead14d0c1c10a43d094f5660ac36c8c))





## [1.6.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.6.0...@-amazeelabs/silverback_gatsby@1.6.1) (2021-06-25)


### Bug Fixes

* **gatsby:** simplify base extension schema and add it to the composed definition ([94c7ec8](https://github.com/AmazeeLabs/silverback-mono/commit/94c7ec82c19975b867e46ccc41e084f0f1912d54))





# [1.6.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.5.0...@-amazeelabs/silverback_gatsby@1.6.0) (2021-06-25)


### Bug Fixes

* **gatsby:** composed schema definition should also include extensions ([cf8566d](https://github.com/AmazeeLabs/silverback-mono/commit/cf8566d5c838bf31b02ec3cbdb1a3ae9e436ba35))


### Features

* **gatsby:** write drupal schema definition to a specific path ([b768a24](https://github.com/AmazeeLabs/silverback-mono/commit/b768a24a63e2ee5151ade6917656d0b38e99b62c))





# [1.5.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.4.1...@-amazeelabs/silverback_gatsby@1.5.0) (2021-06-24)


### Features

* **gatsby:** drush command to export full definition of composable schema ([63644f2](https://github.com/AmazeeLabs/silverback-mono/commit/63644f26376e5890054c91c41dc7464614009584))





## [1.4.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.4.0...@-amazeelabs/silverback_gatsby@1.4.1) (2021-06-23)


### Bug Fixes

* **gatsby:** improve access checks in list_entities producer ([92464b5](https://github.com/AmazeeLabs/silverback-mono/commit/92464b5d47f05aaba5af0bda5ed0979a43b328f4))





# [1.4.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.3.1...@-amazeelabs/silverback_gatsby@1.4.0) (2021-06-23)


### Bug Fixes

* **gatsby:** respect language when loading a single menu ([96e1d37](https://github.com/AmazeeLabs/silverback-mono/commit/96e1d37cc6cfbb088c7ed0b7844d73699e880f45))


### Features

* **gatsby:** menu handling for silverback_gatsby ([5b190f7](https://github.com/AmazeeLabs/silverback-mono/commit/5b190f7e4ecaacb693d6c81ab29081fa85e72257))





## [1.3.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.3.0...@-amazeelabs/silverback_gatsby@1.3.1) (2021-06-22)


### Bug Fixes

* **gatsby:** re-add build monitor state in update trigger ([8958dc5](https://github.com/AmazeeLabs/silverback-mono/commit/8958dc58580b566bb26edc70513b4aeb455d6108))





# [1.3.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.2.1...@-amazeelabs/silverback_gatsby@1.3.0) (2021-06-15)


### Features

* **gatsby:** integrate silverback_gatsby with gatsby_build_monitor ([861df53](https://github.com/AmazeeLabs/silverback-mono/commit/861df534f8191051a2e9fa0a581056393fc4562b))





## [1.2.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.2.0...@-amazeelabs/silverback_gatsby@1.2.1) (2021-06-11)

**Note:** Version bump only for package @-amazeelabs/silverback_gatsby





# [1.2.0](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/silverback_gatsby@1.1.0...@-amazeelabs/silverback_gatsby@1.2.0) (2021-06-09)


### Features

* **gatsby:** provide a gatsby-level field for fetching a specific translation ([2745afc](https://github.com/AmazeeLabs/silverback-mono/commit/2745afc8412ba98750f6019b99e71498447d2903))





# 1.1.0 (2021-05-31)


### Features

* **gatsby:** move silverback_gatsby into shared module space ([5fd1e78](https://github.com/AmazeeLabs/silverback-mono/commit/5fd1e787741ce57ff2818e9885a08b94bd39f961))
