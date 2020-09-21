import { useSiteMetadata } from '@amazeelabs/gatsby-theme-core';
import { Link } from 'gatsby';
import React from 'react';

import amazeeLogo from '../../../assets/logo.svg';

export const Footer: React.FC = () => {
  const site = useSiteMetadata();
  return (
    <div className="bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="xl:col-span-1">
            <Link to="/" className="flex">
              <img className="h-10" src={amazeeLogo} alt={site.title} />
            </Link>
            <p className="mt-8 text-gray-500 text-base leading-6">
              Drupal, Gatsby and React Development and Design
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="text-sm leading-5 font-semibold tracking-wider text-gray-400 uppercase">
                  Section #1
                </h4>
                {/*
                TODO: Add sub-navigation
                <ul className="mt-4">
                  <li>
                    <a
                      href="#"
                      className="text-base leading-6 text-gray-500 hover:text-gray-900"
                    >
                      Marketing
                    </a>
                  </li>
                  <li className="mt-4">
                    <a
                      href="#"
                      className="text-base leading-6 text-gray-500 hover:text-gray-900"
                    >
                      Analytics
                    </a>
                  </li>
                  <li className="mt-4">
                    <a
                      href="#"
                      className="text-base leading-6 text-gray-500 hover:text-gray-900"
                    >
                      Commerce
                    </a>
                  </li>
                  <li className="mt-4">
                    <a
                      href="#"
                      className="text-base leading-6 text-gray-500 hover:text-gray-900"
                    >
                      Insights
                    </a>
                  </li>
                </ul>*/}
              </div>
              <div className="mt-12 md:mt-0">
                <h4 className="text-sm leading-5 font-semibold tracking-wider text-gray-400 uppercase">
                  Section #2
                </h4>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t-2 border-gray-100 pt-8">
          <p className="text-base leading-6 text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()}, Amazee Labs.
          </p>
        </div>
      </div>
    </div>
  );
};
