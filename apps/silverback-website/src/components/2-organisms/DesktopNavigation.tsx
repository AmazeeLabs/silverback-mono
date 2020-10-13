import { useDataDependencies, useFrameworkDependencies } from '@dependencies';
import { useSubPageMenu } from '@hooks';
import classnames from 'classnames';
import React from 'react';

const DesktopNavigation = () => {
  const { Link } = useFrameworkDependencies();
  const { useNavigation } = useDataDependencies();
  const navigation = useNavigation();
  const [activeItems, setActiveItem, close] = useSubPageMenu(
    navigation.map((item) => item.path),
  );
  return (
    <div className="flex items-baseline ml-10 space-x-4">
      {navigation.map(({ path, title, children }, index) => (
        <div key={index} className="relative">
          {children && children.length > 0 ? (
            <>
              <Link
                to="#"
                className={
                  'px-3 py-2 text-lg font-medium leading-6 rounded-md hover:text-white hover:bg-amazee-dark focus:outline-none focus:text-white focus:bg-amazee-dark lg:text-xl lg:px-4 lg:py-3'
                }
                activeClassName={'text-white bg-amazee-dark'}
                onClick={(event) => {
                  setActiveItem(path);
                  event.preventDefault();
                }}
              >
                {title}
              </Link>
              <div
                className={classnames(
                  'absolute z-40 px-2 mt-2 whitespace-no-wrap transform -translate-x-1/2 left-1/2 sm:px-0',
                  {
                    block: activeItems[path],
                    hidden: !activeItems[path],
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
                        ({ path: childPath, title }, childIndex) => (
                          <Link
                            key={childIndex}
                            to={childPath}
                            className={
                              'block py-2 px-4 space-y-1 text-base font-medium transition duration-150 ease-in-out rounded-md hover:bg-amazee-dark hover:text-white'
                            }
                            activeClassName={'text-white bg-amazee-dark'}
                            onClick={close}
                          >
                            {title}
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
              to={path}
              className={
                'px-3 py-2 text-lg font-medium leading-6 rounded-md hover:text-white hover:bg-amazee-dark focus:outline-none focus:text-white focus:bg-amazee-dark lg:text-xl lg:px-4 lg:py-3'
              }
              activeClassName={'text-white bg-amazee-dark'}
              onClick={(event) => {
                setActiveItem(path);
                event.preventDefault();
              }}
            >
              {title}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default DesktopNavigation;
