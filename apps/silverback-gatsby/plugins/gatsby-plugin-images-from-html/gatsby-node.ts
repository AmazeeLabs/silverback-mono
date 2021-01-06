import { CreateNodeArgs, CreateSchemaCustomizationArgs } from 'gatsby';

interface PluginOptions {
  configs: {
    nodeType: string;
    propertyPath: string;
  }[];
}

export const createSchemaCustomization = async (
  args: CreateSchemaCustomizationArgs,
  options: PluginOptions,
) => {
  const types = `"${options.configs.map((it) => it.nodeType).join('", "')}"`;
  args.actions.createTypes(`
    type ImagesFromHtml implements Node @childOf(types: [${types}], many: true) {
      url: String!
    }
  `);
};

export const onCreateNode = async (
  args: CreateNodeArgs,
  options: PluginOptions,
) => {
  const config = options.configs.find(
    (it) => it.nodeType === args.node.internal.type,
  );
  if (config) {
    const html = getHtml(args.node, config.propertyPath);
    if (html) {
      for (const url of parseUrls(html)) {
        const id = args.createNodeId(url);
        args.actions.createNode({
          id,
          url,
          internal: {
            type: 'ImagesFromHtml',
            contentDigest: args.createContentDigest(id),
          },
        });
        args.actions.createParentChildLink({
          parent: args.node,
          child: args.getNode(id),
        });
      }
    }
  }
};

const parseUrls = (html: string): string[] => {
  const matches = html.matchAll(/(src="([^"]+))|(src='([^']+))/gim);
  const result: string[] = [];
  for (const match of matches) {
    result.push(match[2] || match[4]);
  }
  return result;
};

// TODO: if it's going to be a separate package: replace with lodash get or
//  similar.
const getHtml = (object: any, path: string): string | null => {
  let current = object;
  for (
    let i = 0, pathParts = path.split('.'), len = pathParts.length;
    i < len;
    i++
  ) {
    if (current && pathParts[i] in current) {
      current = current[pathParts[i]];
    } else {
      return null;
    }
  }
  return current;
};
