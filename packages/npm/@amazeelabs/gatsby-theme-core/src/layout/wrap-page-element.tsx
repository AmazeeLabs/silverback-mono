import { GatsbyBrowser } from 'gatsby';
import React from 'react';

import { Layout } from './layout';

export const WrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
  props,
}) => <Layout {...props}>{element}</Layout>;
