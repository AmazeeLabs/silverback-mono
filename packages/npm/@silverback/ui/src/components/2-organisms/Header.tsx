import classNames from 'classnames';
import React from 'react';

import { Link, NavItem  } from '../../types';
import {useMobileMenu} from "../../utils";
import {
  Logo
} from '../0-atoms';
import {
  DesktopNavigation,
  MobileMenuButton,
  MobileNavigation,
} from '../1-molecules';

export type HeaderProps = {
  LogoLink: Link;
  navItems: Array<NavItem>;
};

export const Header = ({
  LogoLink,
  navItems
}: HeaderProps) => {
  const [open, toggle] = useMobileMenu();

  return (
    <header className="pb-32 bg-amazee-yellow">
      <div className="mx-auto my-4 max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center h-16 px-4 sm:px-0">
          <div className="flex items-center justify-between text-amazee-dark w-full">
            <LogoLink>
              <Logo />
            </LogoLink>
            <div className="hidden md:flex">
              <DesktopNavigation items={ navItems } />
            </div>
            <div className="flex md:hidden">
              <MobileMenuButton open={open} toggle={toggle} />
            </div>
          </div>
        </div>
      </div>
      <div
        className={classNames('md:hidden', {
          block: open,
          hidden: !open,
        })}
      >
        <MobileNavigation items={ navItems } />
      </div>
    </header>
  );
};
