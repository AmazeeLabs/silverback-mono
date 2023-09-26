import { registerDirective } from './helpers/schema';
import { SilverbackResolver } from './types';

export function directives(register: registerDirective) {
  register('gatsbyNode', (async (
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
  }) satisfies SilverbackResolver);

  register('gatsbyNodes', (async (_, { type }: { type: string }, context) => {
    return (
      await context.nodeModel.findAll({
        type: type,
      })
    ).entries;
  }) satisfies SilverbackResolver);
}
