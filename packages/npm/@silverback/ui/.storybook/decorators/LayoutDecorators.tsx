import React from 'react';
import { DecoratorFn } from '@storybook/react';
import { PageLayout } from '../../src';
import { PageLayoutMocks } from '../../src/components/3-layout/__mocks__/PageLayout.mocks';

export const LayoutDecorator: DecoratorFn = (Story, context) => {
    return (
        <PageLayout {...PageLayoutMocks}>
            <Story {...context} />
        </PageLayout>
    );
};
