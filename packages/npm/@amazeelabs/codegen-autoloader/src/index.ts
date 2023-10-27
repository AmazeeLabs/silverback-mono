import {
  PluginFunction,
  PluginValidateFn,
} from '@graphql-codegen/plugin-helpers';
import { generateAutoloader, printJsAutoload } from './lib';

type Config = {
  context: Array<string>;
  mode: 'js' | 'json';
};

export const validate: PluginValidateFn<Config> = (_, __, config) => {
  if (!config.context || !Array.isArray(config.context)) {
    throw new Error('Missing autoloader context.');
  }
};

export const plugin: PluginFunction<Config> = (schema, _, config) =>
  generateAutoloader(schema, config.context, printJsAutoload);
