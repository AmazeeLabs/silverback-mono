# RSC compatible react-intl

A wrapper around [react-intl](https://formatjs.io/docs/react-intl/) that makes
it compatible with
[React Server Components](https://nextjs.org/docs/advanced-features/react-18/server-components).
It exposes the `useIntl` hook and a non-context enabled version of
`IntlProvider`. The main caveat is that `IntlProvider` is not reactive and won't
propagate changes to the context. Also nesting `IntlProvider` is not supported.
