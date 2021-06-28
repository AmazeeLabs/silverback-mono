import { useGatsbyDependencies } from '@amazeelabs/gatsby-theme-core';
import React from 'react';

import { useDataDependencies } from '../dependencies';

const MobileNavigation = () => {
  const { Link } = useGatsbyDependencies();
  const navigation = useDataDependencies().useNavigation();
  return (
    <div className="px-4 py-3 space-y-1">
      {navigation.map(({ path, title, children }, index) => {
        return (
          <div key={index}>
            <Link
              to={path}
              className="block px-3 py-2 text-base font-medium leading-6 rounded-md focus:outline-none focus:bg-amazee-dark focus:text-white"
              activeClassName="text-white bg-amazee-dark"
            >
              {title}
            </Link>
            {children &&
              children.map(({ path, title }, childIndex) => {
                return (
                  <Link
                    key={childIndex}
                    to={path}
                    className="block px-3 py-2 ml-4 text-base font-medium leading-6 rounded-md focus:outline-none focus:bg-amazee-dark focus:text-white"
                    activeClassName="text-white bg-amazee-dark"
                  >
                    {title}
                  </Link>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

export default MobileNavigation;
