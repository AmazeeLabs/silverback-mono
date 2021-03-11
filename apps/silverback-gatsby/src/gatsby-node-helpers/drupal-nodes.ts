interface DrupalNode {
  multiple: string;
  single: string;
  changes: string;
  type: string;
}

export const drupalNodes: DrupalNode[] = [
  {
    multiple: 'pages',
    single: 'page',
    changes: 'pageChanges',
    type: 'Page',
  },
  {
    multiple: 'gutenbergPages',
    single: 'gutenbergPage',
    changes: 'gutenbergPageChanges',
    type: 'GutenbergPage',
  },
  {
    multiple: 'articles',
    single: 'article',
    changes: 'articleChanges',
    type: 'Article',
  },
  {
    multiple: 'tags',
    single: 'tag',
    changes: 'tagChanges',
    type: 'Tag',
  },
  {
    multiple: 'images',
    single: 'image',
    changes: 'imageChanges',
    type: 'Image',
  },
];
