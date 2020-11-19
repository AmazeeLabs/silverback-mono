import { Node } from 'gatsby';
import { NodeEvent } from 'gatsby-graphql-source-toolkit/dist/types';

import { createQueryExecutor } from './create-query-executor';
import { drupalNodeTypes } from './drupal-node-types';

type Entities = ({ entityId: string } | null)[];

export const fetchNodeChanges = async (
  lastBuildTime: number,
  cachedNodes: Node[],
): Promise<NodeEvent[]> => {
  const result: NodeEvent[] = [];
  const execute = createQueryExecutor();
  for (const [bundle, graphQlType] of Object.entries(drupalNodeTypes)) {
    // Detect updated and newly created content.
    const updatedContent = await execute({
      operationName: 'ContentUpdates',
      query: `
        query ContentUpdates($changed: String!, $bundle: String!) {
          nodeQuery(
            filter: {
              conditions: [
                {
                  field: "changed"
                  value: [$changed]
                  operator: GREATER_THAN
                },
                {
                  field: "type"
                  value: [$bundle]
                }
              ]
            }
          ) {
            entities { entityId }
          }
        }
      `,
      variables: {
        changed: Math.ceil(lastBuildTime / 1000),
        bundle,
      },
    });
    if (!updatedContent.data) {
      console.error('updateResponse.errors', updatedContent.errors);
      throw new Error('Cannot fetch content updates.');
    }
    for (const content of updatedContent.data.nodeQuery.entities as Entities) {
      if (content) {
        result.push({
          eventName: 'UPDATE',
          remoteId: { __typename: graphQlType, entityId: content.entityId },
          remoteTypeName: graphQlType,
        });
      }
    }

    // Detect deleted content.
    const cachedEntityIds = (cachedNodes as (Node & {
      remoteTypeName: string;
      entityId: string;
    })[])
      .filter((node) => node.remoteTypeName === graphQlType)
      .reduce((carry, current) => {
        carry.push(current.entityId);
        return carry;
      }, [] as string[]);
    const existingContent = await execute({
      operationName: 'ExistingContent',
      query: `
        query ExistingContent($entityIds: [String!]!, $bundle: String!) {
          nodeQuery(
            filter: {
              conditions: [
                {
                  field: "nid"
                  value: $entityIds
                  operator: IN
                },
                {
                  field: "type"
                  value: [$bundle]
                }
              ]
            }
          ) {
            entities { entityId }
          }
        }
      `,
      variables: {
        changed: Math.ceil(lastBuildTime / 1000),
        entityIds: cachedEntityIds,
        bundle,
      },
    });
    if (!existingContent.data) {
      console.error('existingContent.errors', existingContent.errors);
      throw new Error('Cannot fetch existing content.');
    }
    const existingEntityIds = (existingContent.data.nodeQuery
      .entities as Entities).reduce((carry, current) => {
      if (current) {
        carry.push(current.entityId);
      }
      return carry;
    }, [] as string[]);
    const deletedEntityIds = cachedEntityIds.filter(
      (id) => !existingEntityIds.includes(id),
    );
    for (const entityId of deletedEntityIds) {
      result.push({
        eventName: 'DELETE',
        remoteId: { __typename: graphQlType, entityId },
        remoteTypeName: graphQlType,
      });
    }
  }

  return result;
};
