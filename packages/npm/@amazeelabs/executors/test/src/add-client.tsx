'use client';
import { Operation, OperationExecutorsProvider } from '../../src/client.js';
import { TestComponent } from './add.js';

export const Add = () => (
  <TestComponent
    label={'Client'}
    OperationExecutorsProvider={OperationExecutorsProvider}
    Operation={Operation}
  />
);
