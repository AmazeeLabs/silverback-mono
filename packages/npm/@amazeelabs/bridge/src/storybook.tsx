import { Location, overrideUrlParameters, Url } from '@custom/schema';
import { action } from '@storybook/addon-actions';
import React, {
  AnchorHTMLAttributes,
  createContext,
  DetailedHTMLProps,
  PropsWithChildren,
  useContext,
} from 'react';
import { createStore, StoreApi, useStore } from 'zustand';

const LocationContext = createContext<StoreApi<Location> | undefined>(
  undefined,
);

export function LocationProvider({
  children,
  search,
  pathname,
  hash,
}: PropsWithChildren<Partial<Omit<Location, 'navigate'>>>) {
  return (
    <LocationContext.Provider
      value={createStore<Location>((set) => ({
        pathname: pathname || '/',
        search: search || new URLSearchParams(),
        hash,
        navigate: (target, search, hash) => {
          if (!target) {
            action('navigate')('invalid target');
          } else {
            action('navigate')(target);
            const url = overrideUrlParameters(target, search, hash);
            const parsed = new URL(url, 'relative:/');
            set((state) => ({
              ...state,
              pathname: parsed.pathname,
              search: parsed.searchParams,
              hash: parsed.hash ? parsed.hash.substr(1) : undefined,
            }));
          }
        },
      }))}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      'LocationProvider not found. Please add it to preview.tsx.',
    );
  }
  return useStore(context);
}

export function Link(
  props: DetailedHTMLProps<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
) {
  const { navigate } = useLocation();
  return (
    <a
      {...props}
      onClick={(ev) => {
        ev.preventDefault();
        if (props.href) {
          navigate(props.href as Url);
        }
      }}
    >
      {props.children}
    </a>
  );
}
