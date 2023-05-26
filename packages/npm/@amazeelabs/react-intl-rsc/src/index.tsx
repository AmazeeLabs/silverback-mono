import type { PropsWithChildren } from 'react';
import React from 'react';
import type { IntlConfig, IntlShape } from 'react-intl';
import { createIntl } from 'react-intl';

import { ClientIntlProvider } from './client';

let intl: IntlShape | undefined = undefined;

export function IntlProvider({
  children,
  ...config
}: PropsWithChildren<IntlConfig>) {
  intl = createIntl(config);
  return <ClientIntlProvider {...config}>{children}</ClientIntlProvider>;
}

export function initializeIntl(config: IntlConfig) {
  intl = createIntl(config);
}

export function useIntl(): IntlShape {
  if (!intl) {
    throw new Error('Intl not initialized.');
  }
  return intl;
}

export function useLocale() {
  return useIntl().locale as 'de' | 'en';
}
