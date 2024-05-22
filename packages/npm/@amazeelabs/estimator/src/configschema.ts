import { z } from 'zod';

export const configSchema = z.object({
  documents: z
    .array(z.string())
    .optional()
    .default(['packages/schema/src/*/**.{gql,graphqls,graphql}']),
  storage: z
    .union([
      z.string(),
      z.object({
        api: z.string(),
        token: z.string(),
        id: z.string(),
      }),
    ])
    .optional()
    .default('estimator.json'),
  weights: z
    .object({
      schema: z
        .object({
          QUERY_FIELD_DEFINITION: z.number().optional().default(8),
          MUTATION_FIELD_DEFINITION: z.number().optional().default(20),
          SUBSCRIPTION_FIELD_DEFINITION: z.number().optional().default(60),
          OBJECT_DEFINITION: z.number().optional().default(4),
          OBJECT_FIELD_DEFINITION: z.number().optional().default(4),
          FIELD_ARGUMENT_DEFINITION: z.number().optional().default(4),
          INTERFACE_DEFINITION: z.number().optional().default(5),
          UNION_DEFINITION: z.number().optional().default(5),
          INPUT_DEFINITION: z.number().optional().default(4),
          INPUT_FIELD_DEFINITION: z.number().optional().default(4),
        })
        .optional()
        .default({
          QUERY_FIELD_DEFINITION: 8,
          MUTATION_FIELD_DEFINITION: 20,
          SUBSCRIPTION_FIELD_DEFINITION: 60,
          OBJECT_DEFINITION: 4,
          OBJECT_FIELD_DEFINITION: 4,
          FIELD_ARGUMENT_DEFINITION: 4,
          INTERFACE_DEFINITION: 5,
          UNION_DEFINITION: 5,
          INPUT_DEFINITION: 4,
          INPUT_FIELD_DEFINITION: 4,
        }),
      operations: z
        .object({
          LIST_TYPE: z.number().optional().default(4),
          NULLABLE_TYPE: z.number().optional().default(2),
          QUERY_OPERATION: z.number().optional().default(8),
          MUTATION_OPERATION: z.number().optional().default(15),
          SUBSCRIPTION_OPERATION: z.number().optional().default(60),
          VARIABLE_DECLARATION: z.number().optional().default(3),
          FRAGMENT_DECLARATION: z.number().optional().default(6),
          SUBSELECTION_DECLARATION: z.number().optional().default(1),
          INLINE_FRAGMENT_DECLARATION: z.number().optional().default(1),
          FIELD_INVOCATION: z.number().optional().default(2),
        })
        .optional()
        .default({
          LIST_TYPE: 4,
          NULLABLE_TYPE: 2,
          QUERY_OPERATION: 8,
          MUTATION_OPERATION: 15,
          SUBSCRIPTION_OPERATION: 60,
          VARIABLE_DECLARATION: 3,
          FRAGMENT_DECLARATION: 6,
          SUBSELECTION_DECLARATION: 1,
          INLINE_FRAGMENT_DECLARATION: 1,
          FIELD_INVOCATION: 2,
        }),
      directives: z
        .record(z.number())
        .optional()
        .transform(
          (value) =>
            ({
              editorBlock: 4,
              resolveEditorBlocks: 0,
              resolveEditorBlockAttribute: 4,
              entity: 6,
              menu: 4,
              resolveMenuItems: 0,
              resolveMenuItemId: 0,
              resolveMenuItemParentId: 0,
              resolveMenuItemLabel: 0,
              resolveMenuItemUrl: 0,
              isPath: 1,
              path: 0,
              template: 10,
              isTemplate: 0,
              resolveEntityPath: 3,
              resolveProperty: 3,
              property: 3,
              resolveEntityReference: 4,
              resolveEntityReferenceRevisions: 4,
              stringTranslation: 0,
              ...value,
            }) as Record<string, number>,
        ),
    })
    .optional()
    .default({}),
});
