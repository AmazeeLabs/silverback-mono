import React from 'react';

export const BlockHtml: React.FC<BlockHtmlFragment> = ({ html }) => (
  <div className={'prose'} dangerouslySetInnerHTML={{ __html: html }} />
);
