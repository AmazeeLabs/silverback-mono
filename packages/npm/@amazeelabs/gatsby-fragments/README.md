# Gatsby fragments

Generates `*.fragment.ts` files from `*.gql` files to use a vendor (Drupal) prefix.

This is necessary to execute equivalent GraphQL queries on the backend (Drupal)
and the frontend (Gatsby) for the instant preview use case.

## Execute one time

```npx @amazeelabs/gatsby-fragments generate --path "path/to/fragment-files```

## Setup on a project

1. Decide which fragments should be used for the instant preview use case (typically: content types, media, ...)
2. Move these fragments in a dedicated directory, e.g. `src/fragments/commons`, that will be used by both Gatsby and Drupal GraphQL
3. Convert possibly existing Gatsby GraphQL Drupal `.ts` fragments files to vendor agnostic `.gql` fragment files
4. Gitignore the generated `*.fragment.ts` files from this common directory
5. Setup the generate fragments script in Gatsby package.json. Example: `"generate-fragments": "node gatsby-fragments generate --path './src/fragments/commons' && eslint \"./src/fragments/commons/**/*.fragment.ts\" --fix && prettier --write \"./src/fragments/commons/**/*.fragment.ts\"",`
6. This script could be added to the `codegen` one, but it needs to be execute first, so generated fragments can be used by codegen. Example: `"codegen": "yarn generate-fragments && graphql-codegen --config codegen.yml"`
8. Fragments in the commons directory can now be executed by both Gatsby and Drupal GraphQL

### Step 3. example:

```typescript
import { graphql } from 'gatsby';
export const fragment = graphql`
  fragment ContentPage on DrupalContentPage {
    __typename:_original_typename
    drupalId
    langcode
    title    
    articleReference {
      ... on DrupalContentArticle {
        drupalId
        langcode
        title
      }
    }
  }`;
```

Becomes

```graphql
fragment ContentPage on ContentPage {
  __typename
  drupalId
  langcode
  title
  articleReference {
    ... on ContentArticle {
      drupalId
      langcode
      title
    }
  }
}
```

The generate script will then convert it back to the original version.

## Manual test

In this directory, execute against the sample test fragments.

```node index.js generate -p "test"```
