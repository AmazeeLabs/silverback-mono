context('test_session', () => {
  beforeEach(() => {
    cy.exec(`./scripts/reset.sh`);
  });

  it('tests USER option', () => {
    const expectAdmin = () => {
      cy.visit('/user');
      cy.url().should('match', /user\/1$/);
      cy.get('h1').should('have.text', 'admin');
    };
    const expectNotAdmin = () => {
      cy.visit('/user');
      cy.url().should('not.match', /user\/1$/);
      cy.get('h1').should('not.have.text', 'admin');
    };

    expectNotAdmin();
    cy.drupalSession({ user: 'admin' });
    expectAdmin();
    cy.drupalSessionClear();
    expectNotAdmin();
  });

  it('tests LANGUAGE option', () => {
    const expectGerman = () => {
      cy.visit('/');
      cy.get('html').should('have.attr', 'lang', 'de');
    };
    const expectNotGerman = () => {
      cy.visit('/');
      cy.get('html').should('not.have.attr', 'lang', 'de');
    };

    expectNotGerman();
    cy.drupalSession({ language: 'de' });
    expectGerman();
    cy.drupalSessionClear();
    expectNotGerman();
  });

  it('tests WORKSPACE option', () => {
    const expectStage = () => {
      cy.visit('/');
      cy.get('.toolbar-icon-workspace').should('have.text', 'Stage');
    };
    const expectNotState = () => {
      cy.visit('/');
      cy.get('.toolbar-icon-workspace').should('not.have.text', 'Stage');
    };

    cy.exec(`./scripts/run.sh 'drush en workspaces'`);
    cy.drupalSession({ user: 'admin', toolbar: true });

    expectNotState();
    cy.drupalSession({ workspace: 'stage' });
    expectStage();
    cy.drupalSession({ workspace: '' });
    expectNotState();
  });

  it('tests TOOLBAR option', () => {
    const expectToolbar = () => {
      cy.visit('/');
      cy.get('#toolbar-bar').should('exist');
    };
    const expectNoToolbar = () => {
      cy.visit('/');
      cy.get('#toolbar-bar').should('not.exist');
    };

    cy.drupalSession({ user: 'admin' });

    expectNoToolbar();
    cy.drupalSession({ toolbar: true });
    expectToolbar();
    cy.drupalSession({ toolbar: false });
    expectNoToolbar();
    cy.drupalSessionClear();
    expectNoToolbar();
  });
});
