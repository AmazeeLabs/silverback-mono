declare global {
  namespace Cypress {
    export interface Chainable<Subject = any> {
      drupalSession(options: Options): Chainable<void>;
      drupalSessionClear(): Chainable<void>;
    }
  }
}

export type Options = {
  user?: string;
  language?: string;
  workspace?: string;
  toolbar?: boolean;
};

const headers = [
  'X-TEST-SESSION-USER',
  'X-TEST-SESSION-LANGUAGE',
  'X-TEST-SESSION-WORKSPACE',
  'X-TEST-SESSION-TOOLBAR',
] as const;

type Header = typeof headers[number];

type Headers = { [key in Header]?: string };

const baseUrl = () =>
  Cypress.env('DRUPAL_BASE_URL') ||
  // Fallback for Drupal Cypress module.
  Cypress.env('DRUPAL_TEST_BASE_URL') ||
  // Default URL produced by Drupal's `drush serve`.
  'http://localhost:8888';

Cypress.Commands.add('drupalSession', function (options: Options) {
  const headers: Headers = {};

  if (options.user !== undefined) {
    headers['X-TEST-SESSION-USER'] = options.user;
  }

  if (options.language !== undefined) {
    headers['X-TEST-SESSION-LANGUAGE'] = options.language;
  }

  if (options.workspace !== undefined) {
    headers['X-TEST-SESSION-WORKSPACE'] = options.workspace;
  }

  if (options.toolbar !== undefined) {
    headers['X-TEST-SESSION-TOOLBAR'] = options.toolbar ? 'on' : 'off';
  }

  cy.request({
    method: 'POST',
    url: `${baseUrl()}/test-session/set`,
    headers,
  });
});

Cypress.Commands.add('drupalSessionClear', function () {
  cy.request({
    method: 'POST',
    url: `${baseUrl()}/test-session/clear`,
  });
});

Cypress.Commands.overwrite(
  'exec',
  (
    originalFn: Cypress.Chainable['exec'],
    command: Parameters<Cypress.Chainable['exec']>[0],
    options: Parameters<Cypress.Chainable['exec']>[1],
  ) => {
    // Show the full error message instead of the default trimmed one. This is
    // a workaround for https://github.com/cypress-io/cypress/issues/5470
    return originalFn(command, { ...options, failOnNonZeroExit: false }).then(
      (result) => {
        if (
          (options?.failOnNonZeroExit === undefined ||
            options.failOnNonZeroExit) &&
          result.code > 0
        ) {
          throw new Error(`Execution of "${command}" failed
Exit code: ${result.code}
Stdout:
${result.stdout}
Stderr:
${result.stderr}`);
        }
        return result;
      },
    );
  },
);
