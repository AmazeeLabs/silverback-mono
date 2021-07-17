# Cypress utils for `@amazeelabs/gatsby-source-silverback`

Adds `cy.waitForCypress` command.

## Installation

1. `yarn add cypress-wait-until @amazeelabs/gatsby-source-silverback-cypress`
1. Add types to `cypress/tsconfig.json`:
   ```
   {
     "compilerOptions": {
       "types": [
         "cypress-wait-until",
         "@amazeelabs/gatsby-source-silverback-cypress",
         ...
   ```
1. Add to `cypress/support/index.js`:
   ```
   import 'cypress-wait-until';
   import '@amazeelabs/gatsby-source-silverback-cypress/commands';
   ```
