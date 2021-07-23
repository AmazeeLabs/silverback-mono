import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { Logo } from "../../0-atoms/Logo";
import { mockNavItems } from '../../1-molecules/__mocks__/mockNavItems.mocks';
import FooterNavigation from "../../1-molecules/FooterNavigation";
import { HeaderMocks } from '../../2-organisms/__mocks__/Header.mocks';
import { Header, HeaderProps } from '../../2-organisms/Header';
import Page from '../Page';

export default {
  title: 'Layouts/Page',
  component: Page,
} as Meta;

export const Default: Story = () => (
  <div className="flex flex-col min-h-screen">
    <Header { ...HeaderMocks } />

    <main className="flex-1 -mt-32">
      <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* {children} */}
      </div>
    </main>

    <footer className="text-base leading-6 text-white bg-amazee-dark lg:text-md xl:text-lg">
      <div className="max-w-screen-xl px-4 py-10 mx-auto sm:px-6 lg:px-8">
        <div className="lg:grid xl:grid-cols-4 xl:gap-8">
          <div className="xl:col-span-1">
            {/* <Link to="/" className="flex"> */}
              <Logo />
            {/* </Link> */}
          </div>
          <div className="mt-12 xl:mt-0 xl:col-span-3">
            <FooterNavigation items={ mockNavItems(3, true) } />
          </div>
        </div>
      </div>
    </footer>
  </div>
);
