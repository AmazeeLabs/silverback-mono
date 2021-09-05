import React, { PropsWithChildren } from 'react';

import { LocationState } from '../types/LocationState';
import { buildMessages } from '../util/build-messages';

type Props = PropsWithChildren<{
  locationState: LocationState;
}>;

export const StandardLayout = ({ locationState, children }: Props) => (
  <>
    <div className="status-messages-wrapper">
      {locationState?.htmlMessages &&
        buildMessages(locationState?.htmlMessages)}
    </div>
    {children}
  </>
);
