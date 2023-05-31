import type {
  LinkType,
  LocationProviderType,
  LocationType,
  useLocationType,
} from '@amazeelabs/bridge';
import { action } from '@storybook/addon-actions';
import React, { createContext, useContext } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';

const LocationContext = createContext<StoreApi<LocationType> | undefined>(
  undefined,
);

export const LocationProvider: LocationProviderType = ({
  children,
  currentLocation,
}) => {
  return (
    <LocationContext.Provider
      value={createStore<LocationType>(
        () => currentLocation || new URL('/', 'relative:/'),
      )}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation: useLocationType = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      'LocationProvider not found. Please add it to preview.tsx.',
    );
  }
  return [
    useStore(context),
    (target) => {
      if (!target) {
        action('navigate')('invalid target');
      } else {
        action('navigate')(target);
        context.setState(() => new URL(target, 'relative:/'));
      }
    },
  ];
};

export const Link: LinkType = (props) => {
  const [, navigate] = useLocation();
  return (
    <a
      {...props}
      onClick={(ev) => {
        ev.preventDefault();
        if (props.href) {
          navigate(props.href);
        }
      }}
    >
      {props.children}
    </a>
  );
};
