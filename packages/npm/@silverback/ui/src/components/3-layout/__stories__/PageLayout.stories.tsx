import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

// import { Logo } from "../../0-atoms/Logo";
// import { mockNavItems } from '../../1-molecules/__mocks__/mockNavItems.mocks';
// import FooterNavigation from "../../1-molecules/FooterNavigation";
// import { HeaderMocks } from '../../2-organisms/__mocks__/Header.mocks';
// import * as HeaderStories '../../2-organisms/Header.stories';
import { PageLayoutMocks } from '../__mocks__/PageLayout.mocks';
import { PageLayout } from '../PageLayout';

export default {
  title: 'Layouts/Page',
  component: PageLayout,
} as Meta;

export const Page: Story = () => (
  <PageLayout {...PageLayoutMocks}>
  </PageLayout>
);
