import React from 'react';

import { FooterMocks } from '../../2-organisms/__mocks__/Footer.mocks';
import { HeaderMocks } from '../../2-organisms/__mocks__/Header.mocks';
import { PageLayout } from '../PageLayout';

export const PageLayoutMocks: React.ComponentProps<typeof PageLayout> = {
  headerProps: HeaderMocks,
  footerProps: FooterMocks,
};
