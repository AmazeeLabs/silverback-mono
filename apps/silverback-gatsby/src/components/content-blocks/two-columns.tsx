import React from 'react';

import { isDefined } from '../../util/is-defined';
import { UnreachableCaseError } from '../../util/types';
import { BlockHtml } from './html';
import { BlockImage } from './image';
import { BlockTeaser } from './teaser';

export const BlockTwoColumns: React.FC<BlockTwoColumnsFragment> = ({
  children,
}) => (
  <div className="columns flex">
    {children?.filter(isDefined).map((column, index) => (
      <div className="column w-1/2" key={index}>
        {column.children?.filter(isDefined).map((block) => {
          switch (block.__typename) {
            case 'DrupalBlockHtmlParagraph':
            case 'DrupalBlockHtmlList':
            case 'DrupalBlockHtmlQuote':
              return <BlockHtml {...block} />;
            case 'DrupalBlockImage':
              return <BlockImage {...block} />;
            case 'DrupalBlockTeaser':
              return <BlockTeaser {...block} />;
            default:
              throw new UnreachableCaseError(block);
          }
        })}
      </div>
    ))}
  </div>
);
