import React from 'react';

import { Link,NavItem } from '../../types';
import {
  Logo
} from '../0-atoms';
import {
  FooterNavigation,
} from '../1-molecules';

export type FooterProps = {
  LogoLink: Link;
  navItems: Array<NavItem>;
};

export const Footer = ({
  LogoLink,
  navItems
}: FooterProps) => {
  return (
    <footer className="text-base leading-6 text-white bg-amazee-dark lg:text-md xl:text-lg">
    <div className="max-w-screen-xl px-4 py-10 mx-auto sm:px-6 lg:px-8">
      <div className="lg:grid xl:grid-cols-4 xl:gap-8">
        <div className="xl:col-span-1">
            <LogoLink>
              <Logo />
            </LogoLink>
        </div>
        <div className="mt-12 xl:mt-0 xl:col-span-3">
          <FooterNavigation items={ navItems } />
        </div>
      </div>
    </div>
    </footer>
)};
