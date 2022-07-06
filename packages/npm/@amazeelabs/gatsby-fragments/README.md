# Gatsby fragments

Generates `*.fragment.ts` files from `*.gql` files to use a vendor prefix.

This is necessary to execute equivalent GraphQL queries on the backend (Drupal)
and the frontend (Gatsby) for use cases like instant preview.

## Execute one time

```npx @amazeelabs/gatsby-fragments generate --path "path/to/fragment-files"```

## Setup on a project

1. Decide which fragments should be used by both backend and frontend (typically: content types, media, ...)
2. Move these fragments in a dedicated directory, e.g. `src/fragments/commons`
3. Convert possibly existing Gatsby GraphQL Drupal `.ts` fragment files to vendor agnostic `.gql` files
4. Gitignore the generated `*.fragment.ts` files from this common directory
5. Setup the `generate` fragments script in Gatsby package.json. Example: `"generate-fragments": "node gatsby-fragments generate --path './src/fragments/commons' && eslint \"./src/fragments/commons/**/*.fragment.ts\" --fix && prettier --write \"./src/fragments/commons/**/*.fragment.ts\"",`
6. This script could be added to the `codegen` one, but it needs to be executed first, so generated fragments can then be used by codegen. Example: `"codegen": "yarn generate-fragments && graphql-codegen --config codegen.yml"`
8. Fragments in the common directory can now be executed by both Gatsby and Drupal GraphQL

### Step 3. example:

Sample existing Drupal Gatsby specific fragment
```typescript
import { graphql } from 'gatsby';

export const fragment = graphql`
  fragment ContentPage on DrupalContentPage {
    __typename
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

Becomes GraphQL vendor agnostic
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

After `generate`, the initial file will be set back to the original version with
`__typename` replaced by `__typename:_original_typename`.
