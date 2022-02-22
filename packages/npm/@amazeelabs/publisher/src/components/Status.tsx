import React, { useEffect } from 'react';

import { GatewayState } from '../states';
import { useStatus } from '../utils/status';
import { GatewayStatus } from './Info';

export default function Status() {
  const { gateway } = useStatus();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (gateway === GatewayState.Ready && params.has('dest')) {
      window.location.href = params.get('dest') as string;
    }
  }, [gateway]);
  return (
    <div>
      <GatewayStatus />
    </div>
  );
}
