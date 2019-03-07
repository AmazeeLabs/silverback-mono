# Development workflow

To get the most out of (and in to) `amazeelabs/silverback`, the development process should follow a common pattern:

1. Review feature/bug request
2. Create the project level feature specification
3. Investigate which parts are not doable by just configuring and/or theming existing components.
4. Try to find a reusable, generic solution (e.g. Views/Rules/Block/GraphQL plugins).
5. Create a pull request against `amazeelabs/silverback` with the proposed changes/additions. It should contain:
    * The code/dependency changes themselves.
    * New or modified feature specifications in `assets/tests/cypress/integration/silverback`.
    * New or modified documentation pages in `docs`.
    * Example configuration in `config`.
6. Apply the pull request as a patch in your projects `composer.json`.
7. If there are dependency changes, you have to add them temporarily to your project's
`composer.json`. Composer patches can't affect dependencies since they are collecteded before patches are applied.

## Working on dependencies

Sometimes it's necessary to work on one of the dependencies of a project. Instead
of creating a separate project or messing with composers checkout of the module,
the `path`  repository can be used to achieve this a little more easily. As an
example, lets create a local checkout of the GraphQL module:


1. Create a new directory called `packages/drupal` within the project directory
and clone the GraphQL module:
```bash
mkdir packages && cd packages
mkdir drupal && cd drupal
git clone git@github.com:drupal-graphql/graphql.git
```

2. Add this directory as a local repository to `composer.json`:
```json
{
  "repositories": [
    {
        "type": "path",
        "url": "./packages/drupal/graphql"
    }
  ]
}
```

3. Require the dev version of the GraphQL module:

```bash
composer require drupal/graphql:8.x-3.x-dev
```

Now the package in Drupal should be symlinked to the local checkout. The [Composer merge plugin](https://github.com/wikimedia/composer-merge-plugin)
could be used to avoid directly modifying `composer.json`. Unfortunately, also in this case
`composer.lock` will be modified and has to be reverted before committing it to the git repository.
