// import { useGatsbyDependencies } from '@amazeelabs/gatsby-theme-core';
import classnames from 'classnames';
import React, { PropsWithChildren } from 'react';

// import { useMobileMenu } from "../../utils";
// import { Logo } from "../0-atoms/Logo";
// import { mockNavItems } from '../1-molecules/__mocks__/mockNavItems.mocks';
// import { DesktopNavigation } from "../1-molecules/DesktopNavigation";
// import { MobileMenuButton } from "../1-molecules/MobileMenuButton";
// import { MobileNavigation } from "../1-molecules/MobileNavigation";
// import FooterNavigation from "../1-molecules/FooterNavigation";
import { Header } from "../2-organisms";

type Props = PropsWithChildren<{}>;

export const Page = ({ children }: Props) => (
  <div className="flex flex-col min-h-screen">
    <Header />

    <main className="flex-1 -mt-32">
      <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children}
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

export default Page;
