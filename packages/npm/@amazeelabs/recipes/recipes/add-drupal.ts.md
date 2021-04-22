# Add Drupal to a Monorepo project

> This recipe should be run in a project that has been created with
> `amazee-recipes create-monorepo`.

## Requirements

For this recipe, you need at least PHP version `7.4` and Composer version `2`
available on your system.

```typescript
$$('php -v', {
  stdout: $$.minimalVersion('7.4'),
});

$$('composer -V', {
  stdout: $$.minimalVersion('2'),
});
```

We make sure the `apps` directory exists and create a new Drupal composer
project inside.

```typescript
$$('mkdir -p apps');
$$.chdir('apps');
$$('composer create-project drupal/recommended-project cms');
$$.chdir('cms');
```

    TODO: all the other things
