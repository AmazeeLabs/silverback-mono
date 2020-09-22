import React from 'react';

import { slugify } from '../utils';

export const TOC: React.FC<{
  items: string[];
}> = ({ items }) => (
  <div className="bg-white rounded-lg shadow-xl px-5 py-6 sm:px-6 mr-4 sticky top-4 flex-none">
    <h3 className="mt-0 font-bold">Table of contents</h3>
    <ul className="list-none mb-0">
      {items.map((item, index) => (
        <li className="mb-1" key={index}>
          <a href={`#${slugify(item)}`}>{item}</a>
        </li>
      ))}
    </ul>
  </div>
);
