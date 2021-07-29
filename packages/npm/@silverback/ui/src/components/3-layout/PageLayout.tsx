import classnames from 'classnames';
import React, { PropsWithChildren } from 'react';

import { ComponentProps } from '../../types';
import { Footer, Header } from "../2-organisms";


type Props = PropsWithChildren<{
  header: ComponentProps<typeof Header>;
  footer: ComponentProps<typeof Footer>;
}>;


export const PageLayout = ({
  header,
  footer,
  children
}: Props) => (
  <div className="flex flex-col min-h-screen">
    <Header {...header}/>

    <main className="flex-1 -mt-32">
      <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children}
      </div>
    </main>

    <Footer {...footer}/>
  </div>
);
