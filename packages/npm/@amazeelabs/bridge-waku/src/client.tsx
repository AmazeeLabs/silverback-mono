'use client';
import type { LocationProviderType, useLocationType } from '@amazeelabs/bridge';
import { useEffect, useState } from 'react';
import { useRouter_UNSTABLE } from 'waku';

export { createLinkComponent } from './link.js';

export const createUseLocationHook: (
  useRouter: typeof useRouter_UNSTABLE,
) => useLocationType = (useRouter) => () => {
  const router = useRouter();

  // TODO: Use router.hash when https://github.com/dai-shi/waku/pull/746 is merged.
  const [hash, setHash] = useState('');
  useEffect(() => {
    setHash(window.location.hash);
  }, [router]);

  return [
    {
      pathname: router.path,
      search: router.searchParams?.toString() || '',
      // TODO: Remove double wrapping, based on feedback in https://github.com/dai-shi/waku/pull/746.
      searchParams: new URLSearchParams(router.searchParams),
      hash,
    },
    router.push,
  ];
};

export const LocationProvider: LocationProviderType = ({ children }) => {
  return <>{children}</>;
};
