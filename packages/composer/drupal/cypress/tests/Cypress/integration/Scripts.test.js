describe('cy.drush', () => {
  it('executes the status command correctly', () => {
    cy.drupalInstall({
      setup: 'cypress:integration/CypressTestSiteInstallScript.php',
    });
    cy.drush('status --field=site').then(result => {
      expect(result.stdout).to.equal(Cypress.env('DRUPAL_SITE_PATH'))
    });
  });
});

describe('cy.drupalScript', () => {
  it('executes a php script to create a node', () => {
    cy.drupalInstall({
      setup: 'cypress:integration/CypressTestSiteInstallScript.php',
    });
    cy.drupalScript('cypress:integration/testPage.php', {title: 'Test page'});
    cy.drupalSession({user: 'admin'});
    cy.visit('/admin/content');
    cy.findByText('Test page');
  });
})
