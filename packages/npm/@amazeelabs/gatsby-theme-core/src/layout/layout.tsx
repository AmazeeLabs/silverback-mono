import React from 'react';

import { Footer } from '../components/footer';
import { Header } from '../components/header';

export const Layout: React.FC = ({ children }) => {
  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};
