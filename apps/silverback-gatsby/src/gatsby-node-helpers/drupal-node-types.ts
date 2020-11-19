type DrupalBundle = string;
type DrupalGraphQlType = string;

export const drupalNodeTypes: Record<DrupalBundle, DrupalGraphQlType> = {
  page: 'NodePage',
  article: 'NodeArticle',
};
