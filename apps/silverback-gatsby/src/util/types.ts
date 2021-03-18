export class UnreachableCaseError extends Error {
  constructor(val: never) {
    super(`Unreachable case: ${JSON.stringify(val)}`);
  }
}
