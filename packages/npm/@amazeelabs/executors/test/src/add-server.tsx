import { Operation, OperationExecutorsProvider } from '../../src/server.js';
import { TestComponent } from './add.js';

export const Add = ({ label }: { label: string }) => (
  <TestComponent
    OperationExecutorsProvider={OperationExecutorsProvider}
    Operation={Operation}
    label={label}
  />
);
