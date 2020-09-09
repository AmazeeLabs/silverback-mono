declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Execute a sequence of commands and take a named snapshot afterwards.
     *
     * Next time time the snapshot is loaded and the commands are skipped.
     *
     * Snapshot is automatically invalidated if the install configuration changes.
     */
    prepareSnapshot(name: string, setup: Function): Chainable<Subject>
  }
}
