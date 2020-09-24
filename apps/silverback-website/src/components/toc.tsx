import React from 'react';

import { slugify } from '../utils';

export const TOC: React.FC<{
  items: string[];
}> = ({ items }) => (
  <aside className="flex-none px-5 py-6 mb-8 bg-white rounded-lg shadow-xl md:w-1/4 sm:px-6 md:mr-4 md:sticky md:top-4 prose prose-sm sm:prose max-w-none sm:max-w-none">
    <h3 className="mt-0 font-bold">Table of contents</h3>
    <ul className="mb-0 list-none">
      {items.map((item, index) => (
        <li className="mb-1" key={index}>
          <a href={`#${slugify(item)}`}>{item}</a>
        </li>
      ))}
    </ul>
  </aside>
);
