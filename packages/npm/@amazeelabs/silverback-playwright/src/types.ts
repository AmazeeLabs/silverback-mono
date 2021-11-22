import { testTypes } from './constants';

export type TestType = typeof testTypes[number];

export type EnvVars = {
  SP_TEST_DIR: string;
  SP_TEST_TYPE: TestType;
  SP_VERBOSE: 'true' | '';
  SP_TRACE: 'true' | '';
};

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
