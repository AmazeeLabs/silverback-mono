# Add Gatsby to a Monorepo project

> This recipe should be run in a project that has been created with
> `amazee-recipes create-monorepo`.

We make sure the `apps` directory exists and create a new Gatsby website based
on `AmazeeLabs/gatsby-starter`.

```typescript
$$('mkdir -p apps');
$$.chdir('apps');
$$('gatsby new website https://github.com/AmazeeLabs/gatsby-starter');
$$.chdir('website');
```

    TODO: all the other things
