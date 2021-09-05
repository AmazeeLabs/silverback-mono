import drupalOnly from './drupal-only/reset-state';
import gatsbyBuild from './gatsby-build/reset-state';
import gatsbyDevelop from './gatsby-develop/reset-state';
import { TestType } from './test-types';

export default async function resetState() {
  const testType: TestType = process.env.SP_TEST_TYPE as TestType;
  switch (testType) {
    case 'drupal-only':
      return await drupalOnly();
    case 'gatsby-develop':
      return await gatsbyDevelop();
    case 'gatsby-build':
      return await gatsbyBuild();
    default:
      throw new UnreachableCaseError(testType);
  }
}

class UnreachableCaseError extends Error {
  constructor(val: never) {
    super(`Unreachable case: ${JSON.stringify(val)}`);
  }
}
