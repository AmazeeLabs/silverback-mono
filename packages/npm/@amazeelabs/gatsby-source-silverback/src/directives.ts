import { SilverbackResolver } from './types';

export const gatsbyNode: SilverbackResolver = async (
  _,
  { type, id }: { type: string; id: string },
  context,
) => {
  return await context.nodeModel.findOne({
    type: type,
    query: {
      filter: {
        id: {
          eq: id,
        },
      },
    },
  });
};

export const gatsbyNodes: SilverbackResolver = async (
  _,
  { type }: { type: string },
  context,
) => {
  return (
    await context.nodeModel.findAll({
      type: type,
    })
  ).entries;
};
