import { DocumentNode, isTypeDefinitionNode, Kind, print } from 'graphql';

/**
 * Extract Object types with @sourceFrom directives.
 *
 * Returns a map of type names to source package and function name tuples.
 */
export function extractSourceMapping(schema: DocumentNode) {
  const directives = {} as Record<string, [string, string]>;
  for (const def of schema.definitions) {
    if (isTypeDefinitionNode(def)) {
      if (def.kind === Kind.OBJECT_TYPE_DEFINITION) {
        const source = def.directives
          ?.filter((dir) => dir.name.value === 'sourceFrom')
          ?.at(0)
          ?.arguments?.at(0)?.value;
        if (source && source.kind === Kind.STRING) {
          directives[def.name.value] = source.value.split('#') as [
            string,
            string,
          ];
        }
      }
    }
  }
  return directives;
}

/**
 * Extract fields types with @resolveBy directives.
 *
 * Returns a nested map of type names, field names, package and function name tuples.
 */
export function extractResolverMapping(schema: DocumentNode) {
  const directives = {} as Record<string, Record<string, [string, string]>>;
  for (const def of schema.definitions) {
    if (isTypeDefinitionNode(def)) {
      if (def.kind === Kind.OBJECT_TYPE_DEFINITION) {
        for (const field of def.fields!) {
          const resolve = field.directives
            ?.filter((dir) => dir.name.value === 'resolveBy')
            ?.at(0)
            ?.arguments?.at(0)?.value;

          if (resolve && resolve.kind === Kind.STRING) {
            if (!directives[def.name.value]) {
              directives[def.name.value] = {};
            }
            directives[def.name.value][field.name.value] = resolve.value.split(
              '#',
            ) as [string, string];
          }
        }
      }
    }
  }
  return directives;
}

/**
 * Extract a list of all union types.
 */
export function extractUnions(schema: DocumentNode) {
  return schema.definitions
    .filter(isTypeDefinitionNode)
    .filter((def) => def.kind === Kind.UNION_TYPE_DEFINITION)
    .map((def) => def.name.value);
}

/**
 * Extract a list of all interface types.
 */
export function extractInterfaces(schema: DocumentNode) {
  return schema.definitions
    .filter(isTypeDefinitionNode)
    .filter((def) => def.kind === Kind.INTERFACE_TYPE_DEFINITION)
    .map((def) => def.name.value);
}

/**
 * Dynamically retrieve a function from a package.
 */
export async function executableDirective(module: string, fn: string) {
  try {
    const m = await import(module);
    if (!m[fn]) {
      throw `Module "${module} has not function "${fn}".`;
    }
    return m[fn];
  } catch (exc) {
    throw `Module "${module}" does not exist.`;
  }
}

/**
 * Clean up a schema string and remove everything that could confuse Gatsby.
 */
export function cleanSchema(schema: DocumentNode) {
  const result = [] as string[];
  schema.definitions.forEach((def) => {
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
