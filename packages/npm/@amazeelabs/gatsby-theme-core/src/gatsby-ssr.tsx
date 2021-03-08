import {Link, navigate, PreRenderHTMLArgs, WrapPageElementNodeArgs} from 'gatsby';
import React, { isValidElement } from 'react';

import {DependencyProvider} from "./dependencies";

export const wrapPageElement = ({element}: WrapPageElementNodeArgs) => (
  <DependencyProvider dependencies={{Link: Link, navigate,}}>
    {element}
  </DependencyProvider>
);

export const onPreRenderHTML = ({ getHeadComponents }: PreRenderHTMLArgs) => {
  if (process.env.NODE_ENV !== 'production') return;

  getHeadComponents().forEach((el) => {
    if (isValidElement(el) && el.type === 'style' && el.props['data-href']) {
      el.type = 'link';
      el.props['href'] = el.props['data-href'];
      el.props['rel'] = 'stylesheet';
      el.props['type'] = 'text/css';

      delete el.props['data-href'];
      delete el.props['dangerouslySetInnerHTML'];
    }
  });
};
