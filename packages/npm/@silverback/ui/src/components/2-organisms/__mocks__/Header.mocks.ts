
import React from 'react';

import { buildLink } from '../../../utils';
import { mockNavItems } from '../../1-molecules/__mocks__/mockNavItems.mocks';
import { Header } from '../Header';

export const HeaderMocks: React.ComponentProps<typeof Header> = {
  navItems: mockNavItems(4, true),
  LogoLink: buildLink('/'),
};
