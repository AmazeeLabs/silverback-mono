import React from 'react';

import { NavigationItems } from '../../types';

export const MobileNavigation = ({ items }: {items: NavigationItems}) => {
  return (
    <div className="px-4 py-3 space-y-1">
      {items.map(({ name, Link, children }, index) => {
        return (
          <div key={index}>
            <Link
              className="block px-3 py-2 text-base font-medium leading-6 rounded-md focus:outline-none focus:bg-amazee-dark focus:text-white"
              activeClassName="text-white bg-amazee-dark"
            >
              {name}
            </Link>
            {children &&
              children.map(({ Link, name }, childIndex) => {
                return (
                  <Link
                    key={childIndex}
                    className="block px-3 py-2 ml-4 text-base font-medium leading-6 rounded-md focus:outline-none focus:bg-amazee-dark focus:text-white"
                    activeClassName="text-white bg-amazee-dark"
                  >
                    {name}
                  </Link>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};
