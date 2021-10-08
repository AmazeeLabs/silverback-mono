import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { PageLayoutMocks } from '../__mocks__/PageLayout.mocks';
import { PageLayout } from '../PageLayout';

export default {
  title: 'Layouts/Page',
  component: PageLayout,
} as Meta;

export const Page: Story = () => <PageLayout {...PageLayoutMocks}></PageLayout>;
