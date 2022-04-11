import { GatsbyBrowser, graphql,PageProps, useStaticQuery, WrapPageElementBrowserArgs } from 'gatsby';
import React, { PropsWithChildren } from 'react';
import { IntlProvider } from 'react-intl';

import { LocationState } from '../types/LocationState';
import { PageContext } from '../types/PageContext';

type Props = PropsWithChildren<{
  pageContext: PageContext;
}>;

const PageWrapper = ({ pageContext, children }: Props) => {
  // @todo: cache this into a global variable or maybe into a json file as this
  // gets called on every page render!
  const {
    allDrupalGatsbyStringTranslation: {nodes: allTranslations}
  } = useStaticQuery<StringTranslationsQuery>(graphql`
    query StringTranslations {
      allDrupalGatsbyStringTranslation {
        nodes {
          id
          source
          translations {
            langcode
            translation
          }
        }
      }
    }
  `);

  const defaultLocale = 'en'
  const langcode = pageContext.locale || defaultLocale;
  const computedTranslations:any = {};
  allTranslations.forEach((translation) => {
    computedTranslations[translation.source] = [translation.translations?.reduce((accumulator: any, currentValue: any) => {
      if (currentValue?.langcode === langcode) {
        return {
          'type': 0,
          'value': currentValue.translation
        };
      }
      if (!accumulator.value && currentValue?.langcode === defaultLocale) {
        return {
          'type': 0,
          'value': currentValue.translation
        }
      }
      return accumulator;
    }, {})];
  });

  return (
    <IntlProvider
      defaultLocale={defaultLocale}
      locale={pageContext.locale}
      messages={computedTranslations}
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
