import React from 'react';

import { Footer } from '../components/footer';
import { Header } from '../components/header';

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="py-10 flex-1">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">{children}</div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
