import { useSiteMetadata } from '@amazeelabs/gatsby-theme-core';
import { useStaticQuery, graphql, Link } from 'gatsby';
import React from 'react';

import amazeeLogo from '../assets/logo.svg';

export const Header: React.FC = () => {
  const { title } = useSiteMetadata();

  const { allMdx } = useStaticQuery<{
    allMdx: {
      edges: {
        node: {
          frontmatter: {
            path: string;
            title: string;
          };
        };
      }[];
    };
  }>(graphql`
    query HeaderQuery {
      allMdx {
        edges {
          node {
            frontmatter {
              path
              title
            }
          }
        }
      }
    }
  `);

  return (
    <div className="bg-amazee-yellow pb-32">
      <nav className="bg-amazee-yellow">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 my-4">
          <div className="flex items-center justify-between h-16 px-4 sm:px-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="flex">
                  <img className="h-12 w-auto" src={amazeeLogo} alt={title} />
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {allMdx.edges.map(({ node }, index) => (
                    <Link
                      key={index}
                      to={node.frontmatter.path}
                      className="px-3 py-2 rounded-md text-base leading-6 font-medium text-amazee-dark hover:text-white hover:bg-amazee-dark focus:outline-none focus:text-white focus:bg-amazee-dark"
                    >
                      {node.frontmatter.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              {/* Mobile menu button */}
              <button className="inline-flex items-center justify-center p-2 rounded-md text-amazee-dark">
                {/* Menu open: "hidden", Menu closed: "block" */}
                <svg
                  className="block h-6 w-6"
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
                  className="hidden h-6 w-6"
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

        {/*
              Mobile menu, toggle classes based on menu state.

              Open: "block", closed: "hidden"
            */}
        <div className="hidden border-b border-amazee-dark md:hidden">
          <div className="px-2 py-3 space-y-1 sm:px-3">
            {allMdx.edges.map(({ node }, index) => (
              <Link
                key={index}
                to={node.frontmatter.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700"
              >
                {node.frontmatter.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};
