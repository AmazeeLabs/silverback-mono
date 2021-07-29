
import { ComponentProps } from '../../../types';
import { buildLink } from '../../../utils';
import { mockNavItems } from '../../1-molecules/__mocks__/mockNavItems.mocks';
import { Footer } from '../Footer';

export const FooterMocks: ComponentProps<typeof Footer> = {
  navItems: mockNavItems(3, true),
  LogoLink: buildLink('/'),
};
