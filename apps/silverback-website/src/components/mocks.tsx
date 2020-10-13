import { DataDependencies, FrameworkDependencies, Link } from '@dependencies';
import React from 'react';

const MockLink: Link = ({
  to,
  className,
  activeClassName,
  children,
  onClick,
}) => (
  <a
    href={to}
    className={
      to.includes('active') ? [className, activeClassName].join(' ') : className
    }
    onClick={onClick}
  >
    {children}
  </a>
);

// TODO: Move to theme.
export const frameworkMocks: FrameworkDependencies = {
  Link: MockLink,
  navigate: () => {},
  SEO: () => null,
};

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
