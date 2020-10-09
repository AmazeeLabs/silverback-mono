# gatsby-plugin-schema-export

Exports the current Gatsby schema to a `*.graphql` file.

## Installation

Install

```bash
yarn add gatsby-plugin-schema-export
```

### Without options
The generated schema will be written to `generated/schema.graphql`.
```js
// gatsby-config.js
  ...
  plugins: [
    'gatsby-plugin-schema-export',
     ...
  ],
```

### With options
The generated schema will be written to `schema/gatsbySchema.graphql`.
```js
// gatsby-config.js
  ...
  plugins: [
    {
      resolve: `gatsby-plugin-schema-export`,
      options: {
        dest: `schemas/gatsbySchema.graphql`,
      },
    },
     ...
  ],
```

## Usage
The generated schema will be written to `generated/schema.graphql` unless the `dest` option is set.

