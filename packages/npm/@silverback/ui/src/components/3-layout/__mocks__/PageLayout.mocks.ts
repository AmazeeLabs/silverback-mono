import { ComponentProps } from '../../../types';
import { HeaderMocks } from '../../2-organisms/__mocks__/Header.mocks';
import { PageLayout } from '../PageLayout';

export const PageLayoutMocks: ComponentProps<typeof PageLayout> = {
  header: HeaderMocks,
  footer: HeaderMocks,
};
