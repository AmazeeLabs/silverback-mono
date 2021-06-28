import { useGatsbyDependencies } from '@amazeelabs/gatsby-theme-core';
import classnames from 'classnames';
import React from 'react';

import {useMobileMenu} from "../../utils";
import Logo from "../0-atoms/Logo";
import MobileMenuButton from "../1-molecules/MobileMenuButton";
import DesktopNavigation from "../2-organisms/DesktopNavigation";
import FooterNavigation from "../2-organisms/FooterNavigation";
import MobileNavigation from "../2-organisms/MobileNavigation";

const Page: React.FC = ({ children }) => {
  const { Link } = useGatsbyDependencies();
  const [open, toggle] = useMobileMenu();
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="pb-32 bg-amazee-yellow">
        <div className="mx-auto my-4 max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center h-16 px-4 sm:px-0">
            <div className="flex items-center justify-between text-amazee-dark w-full">
              <Link to="/" className="flex">
                <Logo />
              </Link>
              <div className="hidden md:flex">
                <DesktopNavigation />
              </div>
              <div className="flex md:hidden">
                <MobileMenuButton open={open} toggle={toggle} />
              </div>
            </div>
          </div>
        </div>
        <div
          className={classnames('md:hidden', {
            block: open,
            hidden: !open,
          })}
        >
          <MobileNavigation />
        </div>
      </nav>

      <main className="flex-1 -mt-32">
        <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="text-base leading-6 text-white bg-amazee-dark lg:text-md xl:text-lg">
        <div className="max-w-screen-xl px-4 py-10 mx-auto sm:px-6 lg:px-8">
          <div className="lg:grid xl:grid-cols-4 xl:gap-8">
            <div className="xl:col-span-1">
              <Link to="/" className="flex">
                <Logo />
              </Link>
            </div>
            <div className="mt-12 xl:mt-0 xl:col-span-3">
              <FooterNavigation />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
