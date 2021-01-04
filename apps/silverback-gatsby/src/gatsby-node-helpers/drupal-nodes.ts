interface DrupalEntityType {
  drupalFields: {
    id: string;
    bundle: string;
  };
  graphQlFields: {
    query: string;
    getById: string;
  };
  bundles: DrupalBundle[];
}

interface DrupalBundle {
  bundle: string;
  graphQlType: string;
}

export const drupalNodes: DrupalEntityType[] = [
  // Content.
  {
    drupalFields: {
      id: 'nid',
      bundle: 'type',
    },
    graphQlFields: {
      query: 'nodeQuery',
      getById: 'nodeById',
    },
    bundles: [
      { bundle: 'page', graphQlType: 'NodePage' },
      { bundle: 'article', graphQlType: 'NodeArticle' },
    ],
  },
  // Taxonomy terms.
  {
    drupalFields: {
      id: 'tid',
      bundle: 'vid',
    },
    graphQlFields: {
      query: 'taxonomyTermQuery',
      getById: 'taxonomyTermById',
    },
    bundles: [{ bundle: 'tags', graphQlType: 'TaxonomyTermTags' }],
  },
  // Media images.
  {
    drupalFields: {
      id: 'mid',
      bundle: 'bundle',
    },
    graphQlFields: {
      query: 'mediaQuery',
      getById: 'mediaById',
    },
    bundles: [{ bundle: 'image', graphQlType: 'MediaImage' }],
  },
];
