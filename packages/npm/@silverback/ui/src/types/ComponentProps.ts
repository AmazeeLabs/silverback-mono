import React from 'react';

/**
 * @see https://javascript.plainenglish.io/a-cleaner-api-for-react-ts-components-47d0704a508c
 */
export type ComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never;
