import { useSiteMetadata } from '@amazeelabs/gatsby-theme-core';
import { useLocation } from '@reach/router';
import classnames from 'classnames';
import { Link } from 'gatsby';
import React, { useState } from 'react';

import amazeeLogo from '../assets/logo.svg';
import { useNavigation } from '../hooks';
import { trim } from '../utils';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { title } = useSiteMetadata();
  const { nodes } = useNavigation();
  const { pathname } = useLocation();

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
                {nodes.map(({ path, title }, index) => {
                  const trimmedPath = trim(path, '/');
                  const trimmedPathname = trim(pathname, '/');
                  const isCurrentPath =
                    trimmedPathname.split('/').shift() == trimmedPath;

                  return (
                    <Link
                      key={index}
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
          {nodes.map(({ path, title }, index) => {
            const trimmedPath = trim(path, '/');
            const trimmedPathname = trim(pathname, '/');
            const isCurrentPath =
              trimmedPathname.split('/').shift() == trimmedPath;

            return (
              <Link
                key={index}
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
            );
          })}
        </div>
      </div>
    </nav>
  );
};
