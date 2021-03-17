import React from 'react';

import { UnreachableCaseError } from '../../util/types';
import { BlockHtml } from './html';
import { BlockImage } from './image';

export const BlockTwoColumns: React.FC<BlockTwoColumnsFragment> = ({
  children,
}) => (
  <div className="columns flex">
    {children.map((column) => (
      <div className="column w-1/2">
        {column.children.map((block) => {
          switch (block.__typename) {
            case 'DrupalBlockHtml':
              return <BlockHtml {...block} />;
            case 'DrupalBlockImage':
              return <BlockImage {...block} />;
            default:
              throw new UnreachableCaseError(block);
          }
        })}
      </div>
    ))}
  </div>
);
