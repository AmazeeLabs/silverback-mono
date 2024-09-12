'use client';
import type { LocationProviderType, useLocationType } from '@amazeelabs/bridge';
import { useRouter_UNSTABLE } from 'waku';

export { createLinkComponent } from './link.js';

export const createUseLocationHook: (
  useRouter: typeof useRouter_UNSTABLE,
) => useLocationType = (useRouter) => () => {
  const router = useRouter();

  return [
    {
      pathname: router.path,
      search: router.query,
      searchParams: new URLSearchParams(router.query),
      hash: router.hash,
    },
    router.push,
  ];
};

export const LocationProvider: LocationProviderType = ({ children }) => {
  return <>{children}</>;
};
