import React from 'react';
import { DecoratorFn } from '@storybook/react';
import { StandardLayout } from '../../src';
export const LayoutDecorator: DecoratorFn = (Story, context) => {
    return (
        <StandardLayout>
            <Story {...context} />
        </StandardLayout>
    );
};