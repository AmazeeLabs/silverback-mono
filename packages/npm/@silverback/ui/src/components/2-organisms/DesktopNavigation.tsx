import classnames from 'classnames';
import React from 'react';

import { NavigationItems } from '../../types';
import { useSubPageMenu } from '../../utils';

export const DesktopNavigation = ({ items }: {items: NavigationItems}) => {
  const [activeItems, setActiveItem, close] = useSubPageMenu(
    items.map((item) => item.id),
  );

  return (
    <div className="flex items-baseline ml-10 space-x-4">
      {items.map(({ name, Link, children }, index) => (
        <div key={index} className="relative">
          {children && children.length > 0 ? (
            <>
              <a
                href="#"
                className={
                  'px-3 py-2 text-lg font-medium leading-6 rounded-md hover:text-white hover:bg-amazee-dark focus:outline-none focus:text-white focus:bg-amazee-dark lg:text-xl lg:px-4 lg:py-3'
                }
                activeClassName={'text-white bg-amazee-dark'}
                onClick={(event) => {
                  setActiveItem(index);
                  event.preventDefault();
                }}
              >
                {name}
              </a>
              <div
                className={classnames(
                  'absolute z-40 px-2 mt-2 whitespace-no-wrap transform -translate-x-1/2 left-1/2 sm:px-0',
                  {
                    block: activeItems[index],
                    hidden: !activeItems[index],
                  },
                )}
              >
                <svg
                  className="absolute left-0 w-full h-3 text-white transform rotate-180 -translate-y-full"
                  x="0px"
                  y="0px"
                  viewBox="0 0 255 255"
                  xmlSpace="preserve"
                >
                  <polygon
                    className="fill-current"
                    points="0,0 127.5,127.5 255,0"
                  />
                </svg>
                <div className="rounded-lg shadow-lg">
                  <div className="overflow-hidden rounded-lg shadow-xs">
                    <div className="relative z-20 p-1 bg-white">
                      {children.map(
                        ({ Link, name }, index) => (
                          <Link
                            key={index}
                            className={
                              'block py-2 px-4 space-y-1 text-base font-medium transition duration-150 ease-in-out rounded-md hover:bg-amazee-dark hover:text-white'
                            }
                            activeClassName={'text-white bg-amazee-dark'}
                            onClick={close}
                          >
                            {name}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link
              className={
                'px-3 py-2 text-lg font-medium leading-6 rounded-md hover:text-white hover:bg-amazee-dark focus:outline-none focus:text-white focus:bg-amazee-dark lg:text-xl lg:px-4 lg:py-3'
              }
              activeClassName={'text-white bg-amazee-dark'}
            >
              {name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};
