import {
  PluginFunction,
  PluginValidateFn,
} from '@graphql-codegen/plugin-helpers';
import { generateAutoloader } from './lib';

type Config = {
  context: string;
};

export const validate: PluginValidateFn<Config> = (_, __, config) => {
  if (!config.context || !(typeof config.context === 'string')) {
    throw new Error('Missing autoloader context.');
  }
};

export const plugin: PluginFunction<Config> = (schema, _, config) =>
  generateAutoloader(schema, config.context);
