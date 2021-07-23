import React from 'react';

import { NavigationItems } from '../../types';
import { useSubPageMenu } from '../../utils';

const FooterNavigation = ({ items }: {items: NavigationItems}) => {
  const [activeItems, setActiveItem, close] = useSubPageMenu(
    items.length,
  );

  return (
    <div className="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8">
    {items.map(({ name, Link, children }, index) => (
        <div className={index ? 'mt-12 md:mt-0' : ''} key={index}>
          {children ? (
            <>
              <h4 className="m-0 font-semibold leading-5 tracking-wider uppercase">
                {name}
              </h4>

              <ul className="mt-4 text-sm list-none lg:text-base">
                {children.map(({ Link, name }, index) => (
                  <li key={index}>
                    <Link className="leading-6">
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <h4 className="m-0 font-semibold leading-5 tracking-wider uppercase">
              <Link to={Link}>{name}</Link>
            </h4>
          )}
        </div>
      ))}
    </div>
  );
};

export default FooterNavigation;
