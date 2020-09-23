import React from 'react';

import { Footer, Header } from '../components';

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 -mt-32">
        <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};
