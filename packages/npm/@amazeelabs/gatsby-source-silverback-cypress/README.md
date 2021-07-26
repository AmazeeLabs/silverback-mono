# Cypress utils for `@amazeelabs/gatsby-source-silverback`

Adds `cy.waitForCypress` command.

## Installation

1. Add types to `cypress/tsconfig.json`:
   ```
   {
     "compilerOptions": {
       "types": [
         "@amazeelabs/gatsby-source-silverback-cypress",
         ...
   ```
1. Add to `cypress/support/index.js`:
   ```
   import '@amazeelabs/gatsby-source-silverback-cypress/commands';
   ```
