import { ComponentProps } from '../../../types';
import { HeaderMocks } from '../../2-organisms/__mocks__/Header.mocks';
// import { buildLink } from '../../atoms/__mocks__/Link.mocks';
// import { mockFooterMenu } from '../../molecules/__mocks__/FooterMenu.mocks';
// import { mockPreFooterMenu } from '../../molecules/__mocks__/PreFooterMenu.mocks';
import { PageLayout } from '../PageLayout';

export const PageLayoutMocks: ComponentProps<typeof PageLayout> = {
  header: HeaderMocks,
  footer: HeaderMocks,
  // footerMenu: mockFooterMenu(4),
  // preFooterMenu: mockPreFooterMenu(3),
  // seo: {
  //   siteName: 'Nagra',
  //   countryCode: 'CH',
  //   title: 'Standard Layout',
  //   description: 'Standard Layout Description',
  //   author: '@amazeelabs',
  //   url: 'https://www.nagra.ch',
  //   imageUrl: 'https://www.nagra.ch/images/logo.png',
  // },
  // messages: ['This is a test message.'],
  // Link: buildLink('/en/contacts'),
};
