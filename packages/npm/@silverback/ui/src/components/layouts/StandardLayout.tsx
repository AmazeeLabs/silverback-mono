import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{}>;

export const StandardLayout = ({ children }: Props) => (
  <div className="max-w-7xl mx-auto">
    <header className="text-4xl p-4 bg-blue-50">Header</header>
    <main className="p-4 prose">{children}</main>
    <footer className="p-4 text-xs bg-blue-900 text-white">Footer</footer>
  </div>
);
