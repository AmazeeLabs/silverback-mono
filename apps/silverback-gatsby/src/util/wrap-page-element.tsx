import { GatsbyBrowser, PageProps, WrapPageElementBrowserArgs } from 'gatsby';
import React, { PropsWithChildren } from 'react';
import { IntlProvider } from 'react-intl';

import { LocationState } from '../types/LocationState';
import { PageContext } from '../types/PageContext';

type Props = PropsWithChildren<{
  pageContext: PageContext;
}>;

function loadLocaleData(locale: string) {
  switch (locale) {
    case 'de':
      return require('../../compiled-lang/de.json');
    default:
      return require('../../compiled-lang/en.json');
  }
}

const PageWrapper = ({ pageContext, children }: Props) => {
  console.log('locale: ', pageContext.locale);
  console.log('data: ', loadLocaleData(pageContext.locale));
  return (
    <IntlProvider
      defaultLocale="en"
      locale={pageContext.locale}
      messages={loadLocaleData(pageContext.locale)}
    >
      {children}
    </IntlProvider>
  );
};

export const WrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
  props,
}: WrapPageElementBrowserArgs<any, PageContext> & {
  props: PageProps<any, PageContext, LocationState>;
}) => <PageWrapper pageContext={props.pageContext}>{element}</PageWrapper>;
