import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { mockNavItems } from '../__mocks__/mockNavItems.mocks';
import { DesktopNavigation } from '../DesktopNavigation';
import Page from '../Page';

export default {
  title: 'Layouts/Page',
  component: Page,
} as Meta;

export const Default: Story = () => <Page />;
