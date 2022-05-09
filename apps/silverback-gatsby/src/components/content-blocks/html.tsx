import React from 'react';

export const BlockHtml: React.FC<
  BlockHtmlListFragment | BlockHtmlParagraphFragment | BlockHtmlQuoteFragment
> = ({ html }) => (
  <div className={'prose'} dangerouslySetInnerHTML={{ __html: html }} />
);
