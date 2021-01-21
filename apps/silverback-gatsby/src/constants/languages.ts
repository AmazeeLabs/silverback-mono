export interface Language {
  id: string;
  pathPrefix: string;
  name: string;
}

export const languages: Language[] = [
  {
    id: 'en',
    pathPrefix: '/en',
    name: 'English',
  },
  {
    id: 'de',
    pathPrefix: '/de',
    name: 'German',
  },
  {
    id: 'fr',
    pathPrefix: '/fr',
    name: 'French',
  },
];
