'use client';

import React, { PropsWithChildren } from 'react';
import { IntlConfig } from 'react-intl';

import { initializeIntl } from './index';

export function ClientIntlProvider({
  children,
  ...config
}: PropsWithChildren<IntlConfig>) {
  initializeIntl(config);
  return <>{children}</>;
}
