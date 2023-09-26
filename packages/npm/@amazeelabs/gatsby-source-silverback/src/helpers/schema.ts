import {
  getArgumentValues,
  GraphQLSchema,
  isInterfaceType,
  isObjectType,
  isUnionType,
  Kind,
  parse,
  print,
} from 'graphql';
import { flow, isString } from 'lodash-es';

import { SilverbackResolver } from '../types';

const directives = {} as Record<string, Function>;

export type registerDirective = (name: string, resolver: Function) => void;

export const registerDirectiveImplementation: registerDirective = (
  name: string,
  resolver: Function,
) => {
  directives[name] = resolver;
};

/**
 * Extract Object types with @sourceFrom directives.
 *
 * Returns a map of type names to source package and function name tuples.
 */
export function extractSourceMapping(schema: GraphQLSchema) {
  const sources = {} as Record<string, string>;
  const sourceFrom = schema.getDirective('sourceFrom');
  if (!sourceFrom) {
    return sources;
  }

  for (const type of Object.values(schema.getTypeMap())) {
    if (isObjectType(type)) {
      for (const directive of type.astNode?.directives || []) {
        if (directive.name.value === 'sourceFrom') {
          const values = getArgumentValues(sourceFrom, directive);
          sources[type.name] = values.fn as string;
          values['fn'];
        }
      }
    }
  }
  return sources;
}

/**
 * Extract fields types with @resolveBy directives.
 *
 * Returns a nested map of type names, field names, package and function name tuples.
 */
export function extractResolverMapping(schema: GraphQLSchema) {
  const resolvers = {} as Record<
    string,
    Record<string, Array<[string, Record<string, unknown>]>>
  >;
  Object.values(schema.getTypeMap()).forEach((type) => {
    if (isObjectType(type)) {
      Object.values(type.getFields()).forEach((field) => {
        field.astNode?.directives?.forEach((dir) => {
          if (dir.name.value === 'resolveBy' || directives[dir.name.value]) {
            const directive = schema.getDirective(dir.name.value);
            if (directive) {
              if (!resolvers[type.name]) {
                resolvers[type.name] = {};
              }
              if (!resolvers[type.name][field.name]) {
                resolvers[type.name][field.name] = [] as Array<
                  [string, Record<string, unknown>]
                >;
              }
              resolvers[type.name][field.name].push([
                directive.name,
                getArgumentValues(directive, dir),
              ]);
            }
          }
        });
      });
    }
  });
  return resolvers;
}

/**
 * Extract a list of all union types.
 */
export function extractUnions(schema: GraphQLSchema) {
  return Object.values(schema.getTypeMap())
    .filter(isUnionType)
    .map((type) => type.name);
}

/**
 * Extract a list of all interface types.
 */
export function extractInterfaces(schema: GraphQLSchema) {
  return Object.values(schema.getTypeMap())
    .filter(isInterfaceType)
    .map((type) => type.name);
}

const loaded = {} as Record<string, Function>;

/**
 * Dynamically retrieve a function from a package.
 */
export async function loadFunction(spec: string): Promise<Function> {
  if (loaded[spec]) {
    return loaded[spec];
  }
  const [module, fn] = spec.split('#');
  try {
    const m = await import(module);
    if (!m[fn]) {
      throw `Module "${module} has not function "${fn}".`;
    }
    loaded[spec] = m[fn];
    return m[fn];
  } catch (exc) {
    throw `Module "${module}" does not exist.`;
  }
}

/**
 * Clean up a schema string and remove everything that could confuse Gatsby.
 */
export function cleanSchema(schema: string) {
  const ast = parse(schema);
  const result = [] as string[];
  ast.definitions.forEach((def) => {
    if (
      def.kind === Kind.SCHEMA_DEFINITION ||
      def.kind === Kind.DIRECTIVE_DEFINITION
    ) {
      return;
    }
    result.push(print(def));
  });
  return result.join('\n');
}

export function processDirectiveArguments(
  parent: unknown,
  args: Record<string, any>,
  spec: Record<string, unknown>,
) {
  return Object.fromEntries(
    Object.keys(spec).map((key) => {
      const val = spec[key];
      if (isString(val)) {
        if (val === '$') {
          return [key, parent];
        }
        if (val.match(/^\$.+/)) {
          return [key, args[val.substr(1)]];
        }
      }
      return [key, spec[key]];
    }),
  );
}

export async function buildResolver(
  config: Array<[string, Record<string, unknown>]>,
): Promise<SilverbackResolver> {
  if (config.length === 1 && config[0][0] === 'resolveBy') {
    return (await loadFunction(
      (config[0][1] as any)['fn'],
    )) as SilverbackResolver;
  }
  return ((source, args, context, info) => {
    const fns = [
      (parent: any) => {
        return parent?.[info?.fieldName];
      },
      ...config.map(([name, spec]) => {
        return (parent: any) => {
          return directives[name](
            parent,
            processDirectiveArguments(parent, args, spec),
            context,
            info,
          );
        };
      }),
    ] as Array<Function>;
    const chain = flow(fns as any);
    return chain(source);
  }) satisfies SilverbackResolver;
}
