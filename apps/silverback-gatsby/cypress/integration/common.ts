export const testImages = () => {
  cy.contains('a', 'With images').click();
  cy.get('.html-from-drupal').then(($item) => {
    const item = cy.wrap($item);
    // There should be kitten and pug images in the Drupal HTML.
    item.get('img[alt=kitten]').should('exist');
    item.get('img[alt=pug]').should('exist');
  });
  // The kitten image should exist in the Drupal HTML and in the media field.
  cy.get('img[alt=kitten]').should('have.length', 2);
  // The pug image should exist only in the Drupal HTML.
  cy.get('img[alt=pug]').should('have.length', 1);
};
