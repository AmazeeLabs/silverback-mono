import { createElement } from 'react';
import { createIntl } from 'react-intl/src/components/createIntl';

import { IntlProvider as ClientIntlProvider } from './client.js';

let intl = null;

export function IntlProvider(props) {
  intl = createIntl(props);
  return createElement(ClientIntlProvider, props);
}

export function useIntl() {
  return intl;
}
