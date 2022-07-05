import {
  OrganismStory,
} from '@amazeelabs/react-framework-bridge/storybook';
import { Meta } from '@storybook/react';

import Info from './Info';

export default {
  component: Info,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const HistoryItems = [
  {
    id: 73,
    type: 'incremental',
    startedAt: 1330210800000,
    finishedAt: 1330297200000,
    success: true,
  },
  {
    id: 72,
    type: 'initial',
    startedAt: 1330210800000,
    finishedAt: 1330297200000,
    success: false,
  },
  {
    id: 13,
    type: 'incremental',
    startedAt: 1330210800000,
    finishedAt: 1330297200000,
    success: true,
  },
  {
    id: 23,
    type: 'incremental',
    startedAt: 1330210800000,
    finishedAt: 1330297200000,
    success: true,
  },
  {
    id: 74,
    type: 'incremental',
    startedAt: 1330210800000,
    finishedAt: 1330297200000,
    success: false,
  },
];

export const ExampleInfo: OrganismStory<typeof Info> = {
  args: {
    historyItems: HistoryItems,
  },
};
