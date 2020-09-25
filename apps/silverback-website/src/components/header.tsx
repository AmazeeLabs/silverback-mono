import { useSiteMetadata } from '@amazeelabs/gatsby-theme-core';
import { useLocation } from '@reach/router';
import classnames from 'classnames';
import { Link } from 'gatsby';
import React, { useEffect, useState } from 'react';

import amazeeLogo from '../assets/logo.svg';
import { useNavigation } from '../hooks';
import { trim } from '../utils';

export const Header: React.FC = () => {
  const { title } = useSiteMetadata();
  const { nodes } = useNavigation();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSubPageMenuOpen, setIsSubPageMenuOpen] = useState<
    Record<string, boolean>
  >(
    nodes.reduce((acc, { path }) => {
      acc[path] = false;
      return acc;
    }, {} as Record<string, boolean>),
  );

  useEffect(() => {
    console.log(nodes);
  }, [nodes]);

  return (
    <nav className="pb-32 bg-amazee-yellow">
      <div className="mx-auto my-4 max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 px-4 sm:px-0">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex">
                <img className="w-auto h-12" src={amazeeLogo} alt={title} />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline ml-10 space-x-4">
                {nodes.map(({ path, title, children }, index) => {
                  const trimmedPath = trim(path, '/').split('/').shift();
                  const trimmedPathname = trim(pathname, '/')
                    .split('/')
                    .shift();
                  const isCurrentPath = trimmedPathname == trimmedPath;

                  return (
                    <div key={index} className="relative">
                      {children && children.length ? (
                        <>
                          <button
                            className={classnames(
                              'px-3 py-2 text-lg font-medium leading-6 rounded-md hover:text-white hover:bg-amazee-dark focus:outline-none focus:text-white focus:bg-amazee-dark lg:text-xl lg:px-4 lg:py-3',
                              {
                                'text-white bg-amazee-dark': isCurrentPath,
                                'text-amazee-dark': !isCurrentPath,
                              },
                            )}
                            onClick={() =>
                              setIsSubPageMenuOpen({
                                ...isSubPageMenuOpen,
                                [path]: !isSubPageMenuOpen[path],
                              })
                            }
                          >
                            {title}
                          </button>

                          <div
                            className={classnames(
                              'absolute z-40 px-2 mt-2 whitespace-no-wrap transform -translate-x-1/2 left-1/2 sm:px-0',
                              {
                                block: isSubPageMenuOpen[path],
                                hidden: !isSubPageMenuOpen[path],
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
                                    (
                                      { path: childPath, title },
                                      childIndex,
                                    ) => {
                                      const trimmedPath = trim(childPath, '/');
                                      const trimmedPathname = trim(
                                        pathname,
                                        '/',
                                      );
                                      const isCurrentPath =
                                        trimmedPathname == trimmedPath;

                                      return (
                                        <Link
                                          key={childIndex}
                                          to={childPath}
                                          className={classnames(
                                            'block py-2 px-4 space-y-1 text-base font-medium transition duration-150 ease-in-out rounded-md hover:bg-amazee-dark hover:text-white',
                                            {
                                              'text-white bg-amazee-dark': isCurrentPath,
                                              'text-amazee-dark': !isCurrentPath,
                                            },
                                          )}
                                          onClick={() =>
                                            setIsSubPageMenuOpen({
                                              ...isSubPageMenuOpen,
                                              [path]: !isSubPageMenuOpen[path],
                                            })
                                          }
                                        >
                                          {title}
                                        </Link>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Link
                          to={path}
                          className={classnames(
                            'px-3 py-2 text-lg font-medium leading-6 rounded-md hover:text-white hover:bg-amazee-dark focus:outline-none focus:text-white focus:bg-amazee-dark lg:text-xl lg:px-4 lg:py-3',
                            {
                              'text-white bg-amazee-dark': isCurrentPath,
                              'text-amazee-dark': !isCurrentPath,
                            },
                          )}
                        >
                          {title}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex -mr-2 md:hidden">
            {/* Mobile menu button */}
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-amazee-dark"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {/* Menu open: "hidden", Menu closed: "block" */}
              <svg
                className={classnames('w-6 h-6', {
                  block: !isMobileMenuOpen,
                  hidden: isMobileMenuOpen,
                })}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Menu open: "block", Menu closed: "hidden" */}
              <svg
                className={classnames('w-6 h-6', {
                  block: isMobileMenuOpen,
                  hidden: !isMobileMenuOpen,
                })}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div
        className={classnames('md:hidden', {
          block: isMobileMenuOpen,
          hidden: !isMobileMenuOpen,
        })}
      >
        <div className="px-4 py-3 space-y-1">
          {nodes.map(({ path, title, children }, index) => {
            const trimmedPath = trim(path, '/');
            const trimmedPathname = trim(pathname, '/');
            const isCurrentPath = trimmedPathname == trimmedPath;

            return (
              <div key={index}>
                <Link
                  to={path}
                  className={classnames(
                    'block px-3 py-2 text-base font-medium leading-6 rounded-md focus:outline-none focus:bg-amazee-dark focus:text-white',
                    {
                      'text-white bg-amazee-dark': isCurrentPath,
                      'text-amazee-dark': !isCurrentPath,
                    },
                  )}
                >
                  {title}
                </Link>
                {children &&
                  children.map(({ path, title }, childIndex) => {
                    const trimmedPath = trim(path, '/');
                    const trimmedPathname = trim(pathname, '/');
                    const isCurrentPath = trimmedPathname == trimmedPath;

                    return (
                      <Link
                        key={childIndex}
                        to={path}
                        className={classnames(
                          'block px-3 py-2 ml-4 text-base font-medium leading-6 rounded-md focus:outline-none focus:bg-amazee-dark focus:text-white',
                          {
                            'text-white bg-amazee-dark': isCurrentPath,
                            'text-amazee-dark': !isCurrentPath,
                          },
                        )}
                      >
                        {title}
                      </Link>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
