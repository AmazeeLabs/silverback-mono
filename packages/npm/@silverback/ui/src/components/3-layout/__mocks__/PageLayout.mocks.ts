import { ComponentProps } from '../../../types';
import { HeaderMocks } from '../../2-organisms/__mocks__/Header.mocks';
import { FooterMocks } from '../../2-organisms/__mocks__/Footer.mocks';
import { PageLayout } from '../PageLayout';

export const PageLayoutMocks: ComponentProps<typeof PageLayout> = {
  headerProps: HeaderMocks,
  footerProps: FooterMocks,
};
