import { Node } from 'gatsby';
import { NodeEvent } from 'gatsby-graphql-source-toolkit/dist/types';

import { createQueryExecutor } from './create-query-executor';
import { drupalNodes } from './drupal-nodes';

type Entity = { entityId: string } | null;
type EntityWithTypename = { entityId: string; __typename: string } | null;

type ToolkitNode = Node & {
  remoteTypeName: string;
  entityId: string;
};

export const fetchNodeChanges = async (
  lastBuildTimeMs: number,
  cachedNodes: Node[],
): Promise<NodeEvent[]> => {
  const result: NodeEvent[] = [];
  const execute = createQueryExecutor();
  for (const entityType of drupalNodes) {
    // Detect updated and newly created content.
    const updatedContent = await execute({
      operationName: 'ContentUpdates',
      variables: {
        changed: Math.ceil(lastBuildTimeMs / 1000),
        bundleField: entityType.drupalFields.bundle,
        bundles: entityType.bundles.map((it) => it.bundle),
      },
      query: `
        query ContentUpdates(
          $changed: String!
          $bundleField: String!
          $bundles: [String!]!
        ) {
          ${entityType.graphQlFields.query}(
            filter: {
              conditions: [
                {
                  field: "changed"
                  value: [$changed]
                  operator: GREATER_THAN
                },
                {
                  field: $bundleField
                  value: $bundles
                  operator: IN
                }
              ]
            }
          ) {
            entities {
              __typename
              entityId
            }
          }
        }
      `,
    });
    if (!updatedContent.data) {
      console.error('updateResponse.errors', updatedContent.errors);
      throw new Error('Cannot fetch content updates.');
    }
    for (const content of updatedContent.data[entityType.graphQlFields.query]
      .entities as EntityWithTypename[]) {
      if (content) {
        result.push({
          eventName: 'UPDATE',
          remoteId: content,
          remoteTypeName: content.__typename,
        });
      }
    }

    // Detect deleted content.
    // Here we have to run query for each bundle separately. Because we need
    // remoteTypeName for the event and we cannot get it from Drupal for content
    // which no longer exist.
    for (const bundle of entityType.bundles) {
      const cachedEntityIds = (cachedNodes as ToolkitNode[])
        .filter((it) => it.remoteTypeName === bundle.graphQlType)
        .map((it) => it.entityId);
      const existingContent = await execute({
        operationName: 'ExistingContent',
        variables: {
          entityIdField: entityType.drupalFields.id,
          entityIds: cachedEntityIds,
          bundleField: entityType.drupalFields.bundle,
          bundle: bundle.bundle,
        },
        query: `
        query ExistingContent(
          $entityIdField: String!
          $entityIds: [String!]!
          $bundleField: String!
          $bundle: String!
        ) {
          ${entityType.graphQlFields.query}(
            filter: {
              conditions: [
                {
                  field: $entityIdField
                  value: $entityIds
                  operator: IN
                },
                {
                  field: $bundleField
                  value: [$bundle]
                }
              ]
            }
          ) {
            entities { entityId }
          }
        }
      `,
      });
      if (!existingContent.data) {
        console.error('existingContent.errors', existingContent.errors);
        throw new Error('Cannot fetch existing content.');
      }
      const existingEntityIds = (existingContent.data[
        entityType.graphQlFields.query
      ].entities as Entity[])
        .filter(Boolean)
        .map((it) => it!.entityId);
      const deletedEntityIds = cachedEntityIds.filter(
        (id) => !existingEntityIds.includes(id),
      );
      for (const entityId of deletedEntityIds) {
        result.push({
          eventName: 'DELETE',
          remoteId: { __typename: bundle.graphQlType, entityId },
          remoteTypeName: bundle.graphQlType,
        });
      }
    }
  }

  // Report results.
  const updated = result.filter((it) => it.eventName === 'UPDATE');
  console.log(
    `ℹ️ sourceNodes will (re)fetch ${updated.length} nodes:`,
    updated.map((it) => it.remoteId),
  );
  const deleted = result.filter((it) => it.eventName === 'DELETE');
  console.log(
    `ℹ️ sourceNodes will delete ${deleted.length} nodes:`,
    deleted.map((it) => it.remoteId),
  );

  return result;
};
