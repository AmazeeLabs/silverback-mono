import { useGatsbyDependencies } from '@amazeelabs/gatsby-theme-core';
import React from 'react';
import { useDataDependencies } from '../dependencies';

const FooterNavigation = () => {
  const { Link } = useGatsbyDependencies();
  const navigation = useDataDependencies().useNavigation();
  return (
    <div className="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8">
      {navigation.slice(1).map(({ path, title, children }, index) => (
        <div className={index ? 'mt-12 md:mt-0' : ''} key={index}>
          {children ? (
            <>
              <h4 className="m-0 font-semibold leading-5 tracking-wider uppercase">
                {title}
              </h4>

              <ul className="mt-4 text-sm list-none lg:text-base">
                {children.map(({ path, title }, index) => (
                  <li key={index}>
                    <Link to={path} className="leading-6">
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <h4 className="m-0 font-semibold leading-5 tracking-wider uppercase">
              <Link to={path}>{title}</Link>
            </h4>
          )}
        </div>
      ))}
    </div>
  );
};

export default FooterNavigation;
