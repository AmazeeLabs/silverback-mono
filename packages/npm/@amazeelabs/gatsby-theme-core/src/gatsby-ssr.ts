import { PreRenderHTMLArgs } from 'gatsby';
import { isValidElement } from 'react';

export { wrapPageElement } from './gatsby-browser';

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
