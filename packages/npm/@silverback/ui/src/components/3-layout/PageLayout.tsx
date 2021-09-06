import React, { PropsWithChildren } from 'react';

import { Footer, Header } from "../2-organisms";


type Props = PropsWithChildren<{
  headerProps: React.ComponentProps<typeof Header>;
  footerProps: React.ComponentProps<typeof Footer>;
}>;


export const PageLayout = ({
  headerProps,
  footerProps,
  children
}: Props) => (
  <div className="flex flex-col min-h-screen">
    <Header {...headerProps}/>

    <main className="flex-1 -mt-32">
      <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children}
      </div>
    </main>

    <Footer {...footerProps}/>
  </div>
);
