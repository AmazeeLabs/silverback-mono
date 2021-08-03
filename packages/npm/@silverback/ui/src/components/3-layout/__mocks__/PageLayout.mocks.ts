import { ComponentProps } from '../../../types';
import { FooterMocks } from '../../2-organisms/__mocks__/Footer.mocks';
import { HeaderMocks } from '../../2-organisms/__mocks__/Header.mocks';
import { PageLayout } from '../PageLayout';

export const PageLayoutMocks: ComponentProps<typeof PageLayout> = {
  headerProps: HeaderMocks,
  footerProps: FooterMocks,
};
