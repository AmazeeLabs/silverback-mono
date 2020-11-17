import { DataDependencies } from '@dependencies';

export const dataMocks: DataDependencies = {
  useNavigation: () => [
    {
      path: '/',
      title: 'Introduction',
    },
    {
      path: '/tooling',
      title: 'Tooling',
      children: [
        {
          path: '/tooling/monorepo',
          title: 'Monorepo',
        },
        {
          path: '/tooling/cypress',
          title: 'Cypress',
        },
        {
          path: '/tooling/jest',
          title: 'Jest',
        },
      ],
    },
    {
      path: '/frontend',
      title: 'Frontend',
      children: [
        {
          path: '/frontend/gatsby',
          title: 'Gatsby',
        },
        {
          path: '/frontend/tailwind',
          title: 'Tailwind',
        },
      ],
    },
  ],
};
