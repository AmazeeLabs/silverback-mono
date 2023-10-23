import type { GraphQLSchema } from 'graphql';

type Implementation = {
  package: string;
  export: string;
};

/**
 * Extract all directive docstrings from a graphql schema.
 */
export const extractDocstrings = (
  schema: GraphQLSchema,
): Record<string, string> =>
  Object.fromEntries(
    schema
      .getDirectives()
      .filter((dir) => dir.astNode?.description?.value)
      .map((dir) => [dir.name, dir.astNode?.description?.value!]),
  );

/**
 * Extract all implementations from a docstring as a Record, keyed with the context.
 *
 * @param docstring The docstring to extract from.
 */
export const extractImplementations = (
  docstring: string,
): Record<string, Implementation> =>
  Object.fromEntries(
    [
      ...docstring.matchAll(
        /^implementation(?:\(([^)]+)\))?:\s*([^#\s]+)#([^#\s]+)$/gm,
      ),
    ].map((match) => {
      const [_, ctx, pkg, exp] = match;
      return [ctx ?? '', { package: pkg, export: exp }];
    }),
  );

/**
 * Select the implementation for a given context or fall back to the default implementation.
 */
export const selectImplementation =
  (
    context: string,
  ): ((input: Record<string, Implementation>) => Implementation) =>
  (input) =>
    input[context] ?? input[''];

/**
 * Print an autoloader from a dictionary of implementations.
 */
export const printAutoload = (
  implementations: Record<string, Implementation>,
) =>
  [
    ...Object.keys(implementations)
      .map(
        (directive, index) =>
          `import { ${implementations[directive].export} as al${index} } from "${implementations[directive].package}";`,
      )
      .filter((line) => !!line),
    'export default {',
    ...Object.keys(implementations)
      .map((directive, index) => `  ${directive}: al${index},`)
      .filter((line) => !!line),
    '};',
  ].join('\n');

/**
 * Generate an autoloader from a graphql schema and a given context.
 */
export const generateAutoloader = (
  schema: GraphQLSchema,
  context: string,
): string => {
  const docstrings = extractDocstrings(schema);
  const selector = selectImplementation(context);
  return printAutoload(
    Object.fromEntries(
      Object.keys(docstrings)
        .map((directive) => {
          const implementation = selector(
            extractImplementations(docstrings[directive]),
          );
          return implementation ? [directive, implementation] : undefined;
        })
        .filter((v): v is [string, Implementation] => Array.isArray(v)),
    ),
  );
};
