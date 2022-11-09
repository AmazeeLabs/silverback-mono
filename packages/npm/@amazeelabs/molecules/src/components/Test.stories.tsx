import {ComponentStoryObj, Meta} from '@storybook/react';

import {Test} from "./Test";


export default {
  title: 'Components/Test',
  component: Test,
} as Meta;

export const Default: ComponentStoryObj<typeof Test> = {
  args: {
  },
};
