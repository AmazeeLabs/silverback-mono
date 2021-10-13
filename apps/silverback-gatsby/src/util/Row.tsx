import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  className?: string;
}>;

export const Row = ({ children, className }: Props) => (
  <td className={`border-solid border-4 ${className}`}>{children}</td>
);
