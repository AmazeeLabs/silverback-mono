'use client';

import { PropsWithChildren } from 'react';

import { ImageSettings } from '../../src/client.js';

export function ClientImageSettings({ children }: PropsWithChildren<{}>) {
  return (
    <ImageSettings alterSrc={(src) => src.replace('9999', '8889')}>
      {children}
    </ImageSettings>
  );
}
