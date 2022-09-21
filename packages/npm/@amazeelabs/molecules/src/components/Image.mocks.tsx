import { omit } from 'lodash';
import { ComponentProps, useEffect } from 'react';

import { Image, useImageContext } from './Image';

export const ReadyPicture: Exclude<
  ComponentProps<typeof Image>['Picture'],
  undefined
> = ({ onLoad, ...props }) => {
  onLoad?.(undefined as any);
  return <picture {...props} />;
};

export const LoadingPicture: Exclude<
  ComponentProps<typeof Image>['Picture'],
  undefined
> = (props) => {
  return <picture {...omit(props, 'onLoad', 'onError')} />;
};

export const ErrorPicture: Exclude<
  ComponentProps<typeof Image>['Picture'],
  undefined
> = ({ onError, ...props }) => {
  onError?.(undefined as any);
  return <picture {...omit(props, 'onLoad')} />;
};

export const DelayedReadyPicture: Exclude<
  ComponentProps<typeof Image>['Picture'],
  undefined
> = ({ onLoad, ...props }) => {
  useEffect(() => {
    window.setTimeout(() => {
      onLoad?.(undefined as any);
    }, 1000);
  }, [onLoad]);
  return <picture {...omit(props, 'onError')} />;
};

export const DelayedErrorPicture: Exclude<
  ComponentProps<typeof Image>['Picture'],
  undefined
> = ({ onError, ...props }) => {
  useEffect(() => {
    window.setTimeout(() => {
      onError?.(undefined as any);
    }, 1000);
  }, [onError]);
  return <picture {...omit(props, 'onLoad')} />;
};

export const CustomPlaceholder = () => {
  const { state } = useImageContext();
  switch (state) {
    case 'loading':
      return <div>🚏 Loading...</div>;
    case 'error':
      return <div>💣 Error!</div>;
    default:
      return <div>😝 This should never be visible.</div>;
  }
};
