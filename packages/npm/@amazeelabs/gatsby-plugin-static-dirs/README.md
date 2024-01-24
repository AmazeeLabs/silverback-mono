# Static directories plugin

Gatsby plugin for adding multiple static directories. It allows to map any
directory to a subdirectory of static assets.

Configuration:

```js
export const plugins = [
  {
    resolve: '@amazeelabs/gatsby-plugin-static-dirs',
    options: {
      directories: {
        'some/root/assets': '/',
        'path/to/admin/app': '/admin',
      },
    },
  },
];
```
