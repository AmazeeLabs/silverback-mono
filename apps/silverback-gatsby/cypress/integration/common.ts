export const testImages = () => {
  // Workaround for "Element is detached from the DOM" on .click() 🤦
  // The .click({ force: true }) workaround also works, but it triggers a page
  // reload and kills the Gatsby navigation.
  // See https://github.com/cypress-io/cypress/issues/7306 for more details.
  cy.wait(100);

  cy.contains('a', 'With everything').click();
  // There should be kitten and pug images in the article.
  cy.get('img[alt="Kitten alt text"]').should('exist');
  cy.get('img[alt="Pug alt text"]').should('exist');
};
