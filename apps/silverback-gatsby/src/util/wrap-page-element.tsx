import {
  GatsbyBrowser,
  graphql,
  PageProps,
  useStaticQuery,
  WrapPageElementBrowserArgs,
} from 'gatsby';
import React, { PropsWithChildren } from 'react';
import { IntlProvider } from 'react-intl';

import originalTranslationSources from '../../generated/translation_sources.json';
import { LocationState } from '../types/LocationState';
import { PageContext } from '../types/PageContext';

type Props = PropsWithChildren<{
  pageContext: PageContext;
}>;

const PageWrapper = ({ pageContext, children }: Props) => {
  // @todo: cache this into a global variable or maybe into a json file as this
  // gets called on every page render!
  const {
    allDrupalGatsbyStringTranslation: { nodes: allTranslations },
  } = useStaticQuery<StringTranslationsQuery>(graphql`
    query StringTranslations {
      allDrupalGatsbyStringTranslation {
        nodes {
          id
          source
          context
          translations {
            langcode
            translation
          }
        }
      }
    }
  `);

  const defaultLocale = 'en';
  const langcode = pageContext.locale || defaultLocale;
  const computedTranslations: any = {};
  // We need to do this trick to convert the imported JSON object into a 'any'
  // type, so that we can access the 'description' property later on, which is
  // not available on all of the extracted translation sources.
  const translationSources: any = originalTranslationSources;
  allTranslations.forEach((translation) => {
    // Because we don't get the generated ids from the translations query, we
    // need to map each of the generated ids from the extracted sources (from
    // the translation_sources.json file) to a translation that we get from
    // graphql. Each translation is uniquely identified by its defaultMessages
    // (which is returned in the source field) and by its description (returned
    //  in the context field).
    const translationSourceKey = Object.keys(translationSources).find((key) => {
      // If we have a description, then the context will be
      // 'gatsby: description', otherwise the context is just 'gatsby'. The
      // context is specified when the translation sources are pushed to Drupal
      // (see the DRUPAL_CREATE_TRANSLATIONS_SOURCE_PATH env variable).
      const context =
        (translationSources[key].description &&
          `gatsby: ${translationSources[key].description}`) ||
        'gatsby';
      return (
        translationSources[key].defaultMessage === translation.source &&
        translation.context === context
      );
    });
    if (translationSourceKey) {
      computedTranslations[translationSourceKey] = [
        translation.translations?.reduce(
          (accumulator: any, currentValue: any) => {
            if (currentValue?.langcode === langcode) {
              return {
                type: 0,
                value: currentValue.translation,
              };
            }
            if (
              !accumulator.value &&
              currentValue?.langcode === defaultLocale
            ) {
              return {
                type: 0,
                value: currentValue.translation,
              };
            }
            return accumulator;
          },
          // Initially, we just use the source string, if no translation was found.
          {
            type: 0,
            value: translation.source,
          },
        ),
      ];
    }
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
