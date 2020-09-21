import React from 'react';

import { Footer } from '../components/footer';
import { Header } from '../components/header';

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="-mt-32 flex-1">
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
